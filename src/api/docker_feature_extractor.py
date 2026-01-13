import docker

client = docker.from_env()

def extract_features_from_image(image_name: str) -> dict:
    """
    Extract Docker image features automatically for ML scanning.
    Handles AWS ECR login if needed.
    """
    client = docker.from_env()

    # ----- AWS ECR login (optional, only if pulling from private registry) -----
    # Only login once; you could make this conditional based on image_name
    ecr_registry = "586098609652.dkr.ecr.ap-south-1.amazonaws.com"
    ecr_username = "AWS"
    import subprocess

    try:
        # Get temporary password from AWS CLI
        ecr_password = subprocess.check_output(
            f"aws ecr get-login-password --region ap-south-1",
            shell=True,
            text=True
        ).strip()

        client.login(username=ecr_username, password=ecr_password, registry=ecr_registry)
        print(f"Logged in to AWS ECR: {ecr_registry}")
    except Exception as e:
        print(f"No ECR login needed or failed: {e}")

    # ----- Pull image (use local if exists) -----
    try:
        image = client.images.get(image_name)
        print(f"Using local image: {image_name}")
    except docker.errors.ImageNotFound:
        print(f"Image not found locally. Pulling {image_name}...")
        image = client.images.pull(image_name)
        print(f"Pulled image: {image_name}")

    # ----- Extract basic features -----
    size_mb = image.attrs.get('Size', 0) / (1024 * 1024)
    layers = len(image.history())
    base_image = image.attrs.get('ContainerConfig', {}).get('Image', 'unknown')

    # Detect package manager (basic heuristic)
    package_manager = "unknown"
    history_str = " ".join([h.get("CreatedBy", "") for h in image.attrs.get("History", [])]).lower()
    if "apt" in history_str:
        package_manager = "deb"
    elif "yum" in history_str or "dnf" in history_str:
        package_manager = "rpm"
    elif "apk" in history_str:
        package_manager = "apk"

    # Return features compatible with scan_image
    return {
        "Size": str(size_mb),
        "Package_Manager": package_manager,
        "Base_Image": base_image,
        "layers": layers,
        "alternative_base_imgs": 0,
        "number_of_tested_dependencies": 0,
        "Critical_Severity": 0,
        "High_Severity": 0,
        "Medium_Severity": 0,
        "Low_Severity": 0
    }
