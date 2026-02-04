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
from src.api.deploy import deploy_to_ec2

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

EC2_HOST = "13.201.137.7"
EC2_USER = "ec2-user"
EC2_KEY_PATH = "/home/hirushi/.ssh/docker-scanner-key.pem"
DOCKER_RUN_OPTIONS = "-d -p 8080:80"

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


# ---------------- RUN SCAN ----------------
def run_scan(image_name: str, source: str):
    # Extract features and scan
    features = extract_features_from_image(image_name)
    result = scan_image(image_name)

    # ---------------- FINAL DECISION LOGIC ----------------
    # Supervised model interpretation
    supervised_decision = "ALLOW" if result["secure_prediction"] == 1 else "DENY"
    supervised_result = "SECURE" if result["secure_prediction"] == 1 else "NOT_SECURE"

    # Anomaly model interpretation
    anomaly_decision = "DENY" if result["anomaly_prediction"] == -1 else "ALLOW"
    anomaly_result = "ANOMALY" if result["anomaly_prediction"] == -1 else "NORMAL"

    # ---- FINAL POLICY (single source of truth) ----
    if supervised_decision == "DENY":
        final_decision = "DENY"
        final_result = "NOT_SAFE"
    elif anomaly_decision == "DENY":
        final_decision = "DENY"
        final_result = "NOT_SAFE"
    else:
        final_decision = "ALLOW"
        final_result = "SAFE"
    
    # Normalize result keys for UI and DB
    db_result = {
        "image_name": image_name,
        "image_tag": image_name.split(":")[-1],
        "registry_type": "public" if source.lower() in ["dockerhub", "public"] else "private",
        "supervised_decision": supervised_decision,
        "supervised_result": supervised_result,
        "anomaly_decision": anomaly_decision,
        "anomaly_result": anomaly_result,
        "predicted_vulnerabilities": result.get("predicted_vulnerabilities", 0),
        "critical_count": result.get("critical_count", 0),
        "high_count": result.get("high_count", 0),
        "medium_count": result.get("medium_count", 0),
        "low_count": result.get("low_count", 0),
        "final_decision": final_decision,
        "final_result": final_result,
        "supervised_explanation": result.get("supervised_explanation") or [],
        "classification_explanation": result.get("classification_explanation") or [],
        "unsupervised_explanation": result.get("unsupervised_explanation") or [],
        "interpretation": result.get("interpretation", ""),
        "ml_timestamp": result.get("ml_timestamp"),
        "scan_time": result.get("scan_time") or datetime.now(timezone.utc)
    }


    print("\n--- ML Scan Result ---")
    for k, v in db_result.items():
        print(f"{k}: {v}")

    save_result_to_db(image_name, source, db_result)

    # ---------------- DEPLOY IF SECURE ----------------
    if db_result["final_decision"] == "ALLOW":
        print(f"✅ Image {image_name} is SAFE. Deploying to EC2...")
        deploy_to_ec2(
            image_name=image_name,
            container_name=f"container_{db_result['image_tag']}",
            run_options=DOCKER_RUN_OPTIONS
        )
    else:
        print(f"❌ Image {image_name} is NOT SAFE. Deployment blocked.")

    return db_result



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
        response = requests.get(DOCKER_HUB_TAGS_URL, timeout=15)
        data = response.json()

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



# ---------------- SAVE TO DB ----------------
def save_result_to_db(image_name, source, result):
    conn = get_db_connection()
    if not conn:
        return
    
    registry_type = "public" if source.lower() in ["dockerhub", "public"] else "private"

    # Prepare explanations as JSON arrays
    supervised_expl = result.get("supervised_explanation") or []
    classification_expl = result.get("classification_explanation") or []
    unsupervised_expl = result.get("unsupervised_explanation") or []

    # Convert to JSON string for MySQL
    supervised_expl_json = json.dumps(supervised_expl, ensure_ascii=False)
    classification_expl_json = json.dumps(classification_expl, ensure_ascii=False)
    unsupervised_expl_json = json.dumps(unsupervised_expl, ensure_ascii=False)


    # Use scan_time or current UTC
    scan_time = result.get("scan_time") or datetime.now(timezone.utc)

    try:
        cursor = conn.cursor()

        insert_query = """
        INSERT INTO scan_results (
            image_name, image_tag, registry_type, predicted_vulnerabilities,
            critical_count, high_count, medium_count, low_count,
            supervised_decision, supervised_result,
            anomaly_decision, anomaly_result,
            final_decision, final_result,
            supervised_explanation, classification_explanation, unsupervised_explanation,
            interpretation, ml_timestamp, scan_time
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        cursor.execute(insert_query, (
            result["image_name"],
            result["image_tag"],
            registry_type,
            result["predicted_vulnerabilities"],
            result.get("critical_count", 0),
            result.get("high_count", 0),
            result.get("medium_count", 0),
            result.get("low_count", 0),
            result.get("supervised_decision", "DENY"),
            result.get("supervised_result", "NOT_SECURE"),
            result.get("anomaly_decision", "DENY"),
            result.get("anomaly_result", "ANOMALY"),
            result.get("final_decision", "DENY"),
            result.get("final_result", "NOT_SAFE"),
            supervised_expl_json,
            classification_expl_json,
            unsupervised_expl_json,
            result.get("interpretation", ""),
            result.get("ml_timestamp"),
            scan_time
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
