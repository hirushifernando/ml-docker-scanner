# deploy.py

import paramiko
import subprocess

# ---------------- CONFIG ----------------
EC2_HOST = "13.201.137.7"               # Replace with your EC2 public IP
EC2_USER = "ec2-user"                   # Usually "ec2-user" for Amazon Linux
EC2_KEY_PATH = "/home/hirushi/.ssh/docker-scanner-key.pem"  # Path to your .pem

ssh_cmd = [
    "ssh",
    "-o", "StrictHostKeyChecking=no",
    "-i", EC2_KEY_PATH,
    f"{EC2_USER}@{EC2_HOST}",
    "echo Connected to EC2"
]

subprocess.run(ssh_cmd, check=True)

# ECR config (only needed for private images)
ECR_REGISTRY = "586098609652.dkr.ecr.ap-south-1.amazonaws.com"  # Replace with your ECR
ECR_REGION = "ap-south-1"


# ---------------- SSH & DEPLOY ----------------
def deploy_to_ec2(image_name, container_name, run_options):
    """
    Connect to EC2 via SSH, pull the secure image, and run the container.
    Handles public Docker Hub and private AWS ECR images.
    """
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    print(f"🔑 Connecting to EC2 {EC2_HOST}...")
    ssh.connect(hostname=EC2_HOST, username=EC2_USER, key_filename=EC2_KEY_PATH)

    commands = [
        "docker --version || sudo yum install docker -y",
        "sudo systemctl start docker",
        "sudo systemctl enable docker",
    ]

    # ----- AWS ECR login if image is private -----
    if ECR_REGISTRY in image_name:
        print(f"🔒 Detected private ECR image: {image_name}")
        # Command to get ECR login password
        ecr_login_cmd = (
            f"aws ecr get-login-password --region {ECR_REGION} "
            f"| docker login --username AWS --password-stdin {ECR_REGISTRY}"
        )
        commands.append(ecr_login_cmd)
    else:
        print(f"🌐 Detected public Docker Hub image: {image_name}")

    # ----- Docker pull, stop, remove, run -----
    commands.extend([
        f"docker pull {image_name}",
        f"docker stop {container_name} || true",
        f"docker rm {container_name} || true",
        f"docker run {run_options} --name {container_name} {image_name}"
    ])

    # Execute commands via SSH
    for cmd in commands:
        print(f"\n💻 Executing: {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        stdout.channel.recv_exit_status()  # Wait for command to finish
        output = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        if output:
            print(output)
        if err:
            print("❌ ERROR:", err)

    ssh.close()
    print("\n✅ Deployment complete!")


# ---------------- MAIN ----------------
if __name__ == "__main__":
    deploy_to_ec2(IMAGE_NAME, CONTAINER_NAME, DOCKER_RUN_OPTIONS)

