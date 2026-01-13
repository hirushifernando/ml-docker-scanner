import requests
import json
import time
from src.api.predict import scan_image
from src.api.docker_feature_extractor import extract_features_from_image
import docker


REGISTRY_URL = "https://hub.docker.com/v2/repositories/library/ubuntu/tags"
SCAN_HISTORY_FILE = "src/data/scanned_images.json"
RESULTS_FILE = "src/data/scan_results.json"
CHECK_INTERVAL = 300  # 5 minutes

client = docker.from_env()


def load_scanned_images():
    try:
        with open(SCAN_HISTORY_FILE, "r") as f:
            return set(json.load(f))
    except FileNotFoundError:
        return set()


def save_scanned_images(images):
    with open(SCAN_HISTORY_FILE, "w") as f:
        json.dump(list(images), f)

def save_result(image, result):
    record = {
        "image": image,
        "result": result,
        "timestamp": time.time()
    }

    try:
        with open("src/data/scan_results.json", "r") as f:
            data = json.load(f)
    except:
        data = []

    data.append(record)

    with open("src/data/scan_results.json", "w") as f:
        json.dump(data, f, indent=2)



def get_latest_images():
    response = requests.get(REGISTRY_URL)
    data = response.json()
    return [f"ubuntu:{tag['name']}" for tag in data["results"]]


def auto_scan():
    scanned = load_scanned_images()
    images = get_latest_images()

    for image in images:
        if image in scanned:
            continue

        print(f"🔍 New image detected: {image}")

        # Pull image
        client.images.pull(image)

        # Extract features
        features = extract_features_from_image(image)

        # Run ML scan
        result = scan_image(features)

        print(f"✅ Scan result for {image}: {result}")

        scanned.add(image)
        save_scanned_images(scanned)


if __name__ == "__main__":
    while True:
        auto_scan()
        time.sleep(CHECK_INTERVAL)
