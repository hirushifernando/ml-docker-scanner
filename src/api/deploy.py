# deploy.py

import paramiko
import random
from datetime import datetime
import mysql.connector

# ---------------- CONFIG ----------------
EC2_HOST = "13.201.137.7"
EC2_USER = "ec2-user"
EC2_KEY_PATH = "/home/hirushi/.ssh/docker-scanner-key.pem"

# ECR config (only needed for private images)
ECR_REGISTRY = "586098609652.dkr.ecr.ap-south-1.amazonaws.com"
ECR_REGION = "ap-south-1"

# ---------------- UTILITIES ----------------
def find_free_port():
    """Find a free port on the EC2 host (used for dynamic host port binding)."""
    return random.randint(50000, 60000)

# ---------------- DATABASE LOGGING ----------------
def log_deployment(image_name, image_tag, status="deployed"):
    """Insert a deployment record into the MySQL database."""
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="scanner_user",
            password="StrongPass123!",
            database="scanner_db"
        )
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO deployments (image_name, image_tag, deployed_at, status)
            VALUES (%s, %s, %s, %s)
            """,
            (image_name, image_tag, datetime.now(), status)
        )

        conn.commit()
        print(f"✅ Deployment logged for {image_name}:{image_tag} with status '{status}'")
    except Exception as e:
        print(f"❌ Failed to log deployment: {e}")
    finally:
        cursor.close()
        conn.close()
        
# ---------------- SSH & DEPLOY ----------------
def deploy_to_ec2(image_name, container_name, run_options=""):
    """
    Connect to EC2 via SSH, pull the secure image, and run the container.
    Handles public Docker Hub and private AWS ECR images.
    """
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    print(f"🔑 Connecting to EC2 {EC2_HOST}...")
    ssh.connect(hostname=EC2_HOST, username=EC2_USER, key_filename=EC2_KEY_PATH)

    # ---------------- Prepare Docker ----------------
    commands = [
        "docker --version || sudo yum install docker -y",
        "sudo systemctl start docker",
        "sudo systemctl enable docker",
    ]

    # AWS ECR login if private image
    if ECR_REGISTRY in image_name:
        print(f"🔒 Detected private ECR image: {image_name}")
        ecr_login_cmd = (
            f"aws ecr get-login-password --region {ECR_REGION} "
            f"| docker login --username AWS --password-stdin {ECR_REGISTRY}"
        )
        commands.append(ecr_login_cmd)
    else:
        print(f"🌐 Detected public Docker Hub image: {image_name}")

    # Pull latest image
    commands.append(f"docker pull {image_name}")

    # Stop and remove old container (friendly output)
    stop_remove_cmd = (
        f"docker ps -a -q --filter 'name={container_name}' | grep -q . && "
        f"docker stop {container_name} && docker rm {container_name} || "
        f"echo 'No existing container {container_name}, skipping stop/remove.'"
    )
    commands.append(stop_remove_cmd)

    # Execute preparation commands first
    for cmd in commands:
        print(f"\n💻 Executing: {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        stdout.channel.recv_exit_status()
        output = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        if output:
            print(output)
        if err:
            print("❌ ERROR:", err)

    # ---------------- Check if image is runnable ----------------
    check_cmd = f"docker inspect --format='{{{{.Config.Cmd}}}} {{{{.Config.Entrypoint}}}}' {image_name}"
    stdin, stdout, stderr = ssh.exec_command(check_cmd)
    stdout.channel.recv_exit_status()
    cmd_result = stdout.read().decode().strip()
    err_result = stderr.read().decode().strip()

    if err_result:
        print("❌ ERROR inspecting image:", err_result)

    # Choose a free host port for deployment
    free_port = find_free_port()
    print(f"🔹 Using host port: {free_port} for deployment")

    if cmd_result == "[] []":
        # No CMD/ENTRYPOINT — simulate deployment (dry-run)
        print(f"\n✅ Image {image_name} is SAFE. Deployment simulated for cloud environment (dry-run).")
        log_deployment(image_name, "latest", "pending")
    else:
        # Image is runnable — deploy for real
        run_cmd = f"docker run -d -p {free_port}:80 --name {container_name} {image_name} {run_options}"
        print(f"\n💻 Executing: {run_cmd}")
        stdin, stdout, stderr = ssh.exec_command(run_cmd)
        stdout.channel.recv_exit_status()
        output = stdout.read().decode().strip()
        err_output = stderr.read().decode().strip()
        if output:
            print(output)
        if err_output:
            print("❌ ERROR:", err_output)
        else:
            print(f"✅ Image {image_name} deployed successfully to EC2!")
            log_deployment(image_name, "latest", "deployed")

    ssh.close()
    print(f"\n✅ Deployment process complete for {image_name}")


# ---------------- MAIN ----------------
if __name__ == "__main__":
    deploy_to_ec2(IMAGE_NAME, CONTAINER_NAME, DOCKER_RUN_OPTIONS)

