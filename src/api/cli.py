import sys
import docker
import requests
import json
from datetime import datetime
import os
from .predict import scan_image

# Optional: URL of your web dashboard API
DASHBOARD_API_URL = "http://localhost:8000/scan"  # change if your dashboard is deployed
RESULTS_FILE = "scan_results.json"


# -------------------------------
# Save scan result to JSON file
# -------------------------------
def save_result_to_file(image_name: str, result: dict):
    # Add timestamp and image name
    result_record = {
        "image_name": image_name,
        "timestamp": datetime.now().isoformat(),
        "result": result
    }

    # Read existing results
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE, "r") as f:
            data = json.load(f)
    else:
        data = []

    # Append new result
    data.append(result_record)

    # Save back
    with open(RESULTS_FILE, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Saved scan result for {image_name} to {RESULTS_FILE}")


# -------------------------------
# Extract features from Docker image
# -------------------------------
def extract_features_from_image(image_name: str) -> dict:
    """
    Extract Docker image features automatically for ML scanning.
    """
    client = docker.from_env()

    # Try to get local image, pull if not found
    try:
        image = client.images.get(image_name)
        print(f"Found local image: {image_name}")
    except docker.errors.ImageNotFound:
        print(f"Image not found locally. Pulling {image_name} from registry...")
        image = client.images.pull(image_name)
        print(f"Pulled image: {image_name}")

    # ----- Extract basic features -----
    size_mb = image.attrs.get('Size', 0) / (1024 * 1024)  # bytes → MB
    layers = len(image.attrs.get('RootFS', {}).get('Layers', []))
    base_image = image.attrs.get('ContainerConfig', {}).get('Image', 'unknown')

    # Simple package manager detection (basic heuristic)
    package_manager = "unknown"
    history = image.attrs.get("History", [])
    history_str = " ".join([h.get("CreatedBy", "") for h in history]).lower()
    if "apt" in history_str:
        package_manager = "deb"
    elif "yum" in history_str or "dnf" in history_str:
        package_manager = "rpm"
    elif "apk" in history_str:
        package_manager = "apk"

    # Default placeholder values
    return {
        "Size": str(size_mb),  # string if ML model expects string
        "Package_Manager": package_manager,
        "Base_Image": base_image,
        "alternative_base_imgs": 0,
        "number_of_tested_dependencies": 0,
        "layers": layers,
        "Critical_Severity": 0,
        "High_Severity": 0,
        "Medium_Severity": 0,
        "Low_Severity": 0
    }


# -------------------------------
# CLI main function
# -------------------------------
def main():
    """
    CLI entry point for scanning a Docker image.
    Usage:
        python -m src.api.cli scan <IMAGE_NAME>
    """
    if len(sys.argv) < 3 or sys.argv[1] != "scan":
        print("Usage: python -m src.api.cli scan <IMAGE_NAME>")
        sys.exit(1)

    image_name = sys.argv[2]
    print(f"Scanning Docker image: {image_name}")

    # Run ML scan (scan_image expects the image_name string)
    result = scan_image(image_name)

    # Print result nicely
    print("\n--- Scan Result ---")
    for key, value in result.items():
        print(f"{key}: {value}")

    # Save result to local JSON
    save_result_to_file(image_name, result)

    # Optional: Send result to dashboard API
    try:
        response = requests.post(DASHBOARD_API_URL, json={"image_name": image_name})
        if response.status_code == 200:
            print("\nResult sent to dashboard successfully.")
        else:
            print(f"\nFailed to send to dashboard. Status code: {response.status_code}")
    except Exception as e:
        print(f"\nError sending to dashboard: {str(e)}")



if __name__ == "__main__":
    main()
