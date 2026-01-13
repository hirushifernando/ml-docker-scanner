import pandas as pd
import joblib
import numpy as np
import subprocess
import json
from pathlib import Path

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent
MODEL_STORE = BASE_DIR / "model_store"

# -----------------------------
# Load encoders & scalers
# -----------------------------
le_package = joblib.load(MODEL_STORE / "le_package.pkl")
le_base = joblib.load(MODEL_STORE / "le_base.pkl")

le_package_unsup = joblib.load(MODEL_STORE / "le_package_unsup.pkl")
le_base_unsup = joblib.load(MODEL_STORE / "le_base_unsup.pkl")
scaler_unsup = joblib.load(MODEL_STORE / "unsupervised_scaler.pkl")

# -----------------------------
# Feature lists
# -----------------------------
REG_FEATURES = [
    'Size', 'Package Manager', 'Base Image',
    '# alternative base imgs', 'number of tested dependencies', 'layers'
]

CLF_FEATURES = [
    'Size', 'Package Manager', 'Base Image',
    '# alternative base imgs', 'number of tested dependencies',
    'Critical Severity', 'High Severity', 'Medium Severity', 'Low Severity', 'layers'
]

UNSUP_FEATURES = [
    'Size', 'Package Manager', 'Base Image',
    '# alternative base imgs', 'number of tested dependencies', 'layers'
]

# -----------------------------
# Docker helpers
# -----------------------------
def pull_image(image_name: str):
    subprocess.run(
        ["docker", "pull", image_name],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True
    )

def inspect_image(image_name: str) -> dict:
    result = subprocess.check_output(
        ["docker", "inspect", image_name],
        text=True
    )
    return json.loads(result)[0]

def size_to_mb(bytes_size):
    return round(bytes_size / (1024 * 1024), 2)

# -----------------------------
# Feature extraction
# -----------------------------
def extract_features(image_name: str) -> dict:
    pull_image(image_name)
    info = inspect_image(image_name)

    size_mb = size_to_mb(info.get("Size", 0))
    layers = len(info.get("RootFS", {}).get("Layers", []))
    base_image = info.get("Config", {}).get("Image", "unknown")

    # Simple heuristics (no retraining)
    package_manager = (
        "apk" if "alpine" in image_name.lower()
        else "deb" if "debian" in image_name.lower() or "ubuntu" in image_name.lower()
        else "rpm" if "centos" in image_name.lower()
        else "unknown"
    )

    return {
        "Size": size_mb,
        "Package Manager": package_manager,
        "Base Image": base_image,
        "# alternative base imgs": 0,
        "number of tested dependencies": 0,
        "Critical Severity": 0,
        "High Severity": 0,
        "Medium Severity": 0,
        "Low Severity": 0,
        "layers": layers
    }

# -----------------------------
# Safe encoders
# -----------------------------
def safe_transform(le, value):
    try:
        return le.transform([value])[0]
    except ValueError:
        return -1

# -----------------------------
# Supervised preprocessing
# -----------------------------
def preprocess_supervised(image_name: str, task="classification") -> pd.DataFrame:
    data = extract_features(image_name)
    df = pd.DataFrame([data])

    df['Package Manager'] = df['Package Manager'].apply(lambda x: safe_transform(le_package, x))
    df['Base Image'] = df['Base Image'].apply(lambda x: safe_transform(le_base, x))

    if task == "classification":
        return df[CLF_FEATURES]
    return df[REG_FEATURES]

# -----------------------------
# Unsupervised preprocessing
# -----------------------------
def preprocess_unsupervised(image_name: str) -> pd.DataFrame:
    data = extract_features(image_name)
    df = pd.DataFrame([data])

    df['Package Manager'] = df['Package Manager'].apply(lambda x: safe_transform(le_package_unsup, x))
    df['Base Image'] = df['Base Image'].apply(lambda x: safe_transform(le_base_unsup, x))

    df = df[UNSUP_FEATURES]
    df_scaled = pd.DataFrame(
        scaler_unsup.transform(df),
        columns=df.columns
    )

    return df_scaled
