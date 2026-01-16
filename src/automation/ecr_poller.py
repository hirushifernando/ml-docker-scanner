# ecr_poller.py

import boto3
import docker
import time
import json
import os
import requests
from datetime import datetime, timezone
import mysql.connector
from mysql.connector import Error

from src.api.predict import scan_image
from src.api.docker_feature_extractor import extract_features_from_image

# ---------------- CONFIG ----------------
REGION = "ap-south-1"
REPO_NAME = "private-test"
ACCOUNT_ID = "586098609652"

# Public Docker Hub config (example: ubuntu)
# Public Docker Hub config
DOCKER_HUB_REPO = "hirufernando275/tiny-ml-test"
DOCKER_HUB_TAGS_URL = f"https://hub.docker.com/v2/repositories/{DOCKER_HUB_REPO}/tags"

POLL_INTERVAL = 60  # seconds
SCANNED_FILE = "scanned_images.json"
DASHBOARD_API_URL = None  # optional

# ---------------- INIT ----------------
ecr = boto3.client("ecr", region_name=REGION)
docker_client = docker.from_env()

# Load scanned history
if os.path.exists(SCANNED_FILE):
    with open(SCANNED_FILE, "r") as f:
        scanned_images = set(json.load(f))
else:
    scanned_images = set()


# ---------------- UTIL FUNCTIONS ----------------
def save_scanned_images():
    with open(SCANNED_FILE, "w") as f:
        json.dump(list(scanned_images), f, indent=2)


def login_to_ecr():
    """ECR login is handled manually via AWS CLI"""
    try:
        token = ecr.get_authorization_token()["authorizationData"][0]
        registry = token["proxyEndpoint"]
        print(f"✅ Logged in to ECR (manual login required): {registry}")
    except Exception as e:
        print(f"⚠️ ECR login skipped: {e}")


def pull_image(image_uri: str):
    try:
        docker_client.images.get(image_uri)
        print(f"Using local image: {image_uri}")
    except docker.errors.ImageNotFound:
        print(f"Pulling image: {image_uri}")
        docker_client.images.pull(image_uri)
        print(f"✅ Pulled image: {image_uri}")


def run_scan(image_name: str, source: str):
    result = scan_image(image_name)
    result["image_name"] = image_name
    result["timestamp"] = datetime.now(timezone.utc).isoformat()
    result["image_tag"] = image_name.split(":")[-1]  # optional, extract tag

    print("\n--- ML Scan Result ---")
    for k, v in result.items():
        print(f"{k}: {v}")

    try:
        save_result_to_db(image_name, source, result)
    except Exception as e:
        print(f"❌ Failed to save result to DB: {e}")

    return result



# ---------------- ECR FUNCTIONS ----------------
def get_images_from_ecr():
    try:
        response = ecr.describe_images(repositoryName=REPO_NAME)
        return response.get("imageDetails", [])
    except Exception as e:
        print(f"❌ Failed to fetch ECR images: {e}")
        return []


def poll_ecr():
    print("\n🔁 Checking AWS ECR...")
    images = get_images_from_ecr()

    for img in images:
        digest = img["imageDigest"]
        tags = img.get("imageTags", [])

        if not tags or digest in scanned_images:
            continue

        tag = tags[0]
        image_uri = f"{ACCOUNT_ID}.dkr.ecr.{REGION}.amazonaws.com/{REPO_NAME}:{tag}"

        print(f"\n🔹 New ECR image detected: {image_uri}")
        pull_image(image_uri)
        run_scan(image_uri, source="ECR")

        scanned_images.add(digest)
        save_scanned_images()


# ---------------- DOCKER HUB FUNCTIONS ----------------
def get_public_images():
    try:
        response = requests.get(DOCKER_HUB_TAGS_URL, timeout=5)
        data = response.json()

        print("🐳 Docker Hub raw response:", data)

        return [
            f"{DOCKER_HUB_REPO}:{tag['name']}"
            for tag in data.get("results", [])
        ]
    except Exception as e:
        print(f"❌ Failed to fetch Docker Hub tags: {e}")
        return []




def poll_docker_hub():
    print("\n🔁 Checking Docker Hub (public)...")
    images = get_public_images()

    for image in images:
        if image in scanned_images:
            continue

        print(f"\n🔹 New public image detected: {image}")
        pull_image(image)
        run_scan(image, source="DockerHub")


        scanned_images.add(image)
        save_scanned_images()


def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="scanner_user",
            password="StrongPass123!",
            database="scanner_db"
        )
        return conn
    except mysql.connector.Error as e:
        print(f"❌ DB Connection error: {e}")
        return None



def save_result_to_db(image_name, source, result):
    conn = get_db_connection()
    if not conn:
        return
    
    registry_type = "public" if source.lower() in ["dockerhub", "public"] else "private"

    try:
        cursor = conn.cursor()

        insert_query = """
        INSERT INTO scan_results
        (
            image_name,
            image_tag,
            registry_type,
            scan_time,
            vulnerabilities,
            critical_count,
            high_count,
            medium_count,
            low_count,
            decision,
            supervised_explanation,
            classification_explanation,
            unsupervised_explanation,
            interpretation,
            model_decision,
            ml_timestamp
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """


        cursor.execute(insert_query, (
        image_name,
        result.get("image_tag"),
        registry_type,
        datetime.now(),
        result.get("predicted_vulnerabilities"),
        result.get("critical_count"),
        result.get("high_count"),
        result.get("medium_count"),
        result.get("low_count"),
        result.get("decision"),
        json.dumps(result.get("supervised_explanation")),
        json.dumps(result.get("classification_explanation")),
        json.dumps(result.get("unsupervised_explanation")),
        result.get("interpretation"),
        result.get("model_decision"),
        result.get("timestamp")
    ))


        conn.commit()
        print(f"✅ Scan result saved to DB for {image_name}")

    except Error as e:
        print(f"❌ Failed to insert into DB: {e}")

    finally:
        cursor.close()
        conn.close()



# ---------------- MAIN LOOP ----------------
def poll_once():
    print("\n🚀 Running poll iteration...")
    login_to_ecr()
    poll_ecr()
    poll_docker_hub()
    print("✅ Poll iteration complete")


if __name__ == "__main__":
    poll_once()
