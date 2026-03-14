from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import mysql.connector
from mysql.connector import Error
import json

from .predict import scan_image
from typing import List

class MultiDockerImageRequest(BaseModel):
    image_names: List[str]

# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI(
    title="Docker Image Security Scanner",
    description="Scan Docker images directly using ML models with explanations",
    version="2.0.0"
)

# -----------------------------
# CORS (allow Next.js)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your Next.js dev URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# DB Connection
# -----------------------------
def get_db_connection():
    try:
        return mysql.connector.connect(
            host="localhost",
            user="scanner_user",
            password="StrongPass123!",
            database="scanner_db"
        )
    except Error as e:
        print("DB Connection Error:", e)
        return None

# -----------------------------
# Input model
# -----------------------------
class DockerImageRequest(BaseModel):
    image_name: str

# -----------------------------
# Health Check
# -----------------------------
@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "message": "Docker Image ML Scanner is running",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0"
    }

# -----------------------------
# Scan Endpoint
# -----------------------------
@app.post("/scan")
def scan_docker_image(request: DockerImageRequest):
    try:
        result = scan_image(request.image_name)
        result["timestamp"] = datetime.utcnow().isoformat()

        return {
            "status": "success",
            "data": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error scanning Docker image: {str(e)}"
        )

@app.post("/scan-multiple")
def scan_multiple_docker_images(request: MultiDockerImageRequest):
    results = []
    for image_name in request.image_names:
        try:
            result = scan_image(image_name)
            result["timestamp"] = datetime.utcnow().isoformat()
            results.append({
                "image_name": image_name,
                "status": "success",
                "data": result
            })
        except Exception as e:
            results.append({
                "image_name": image_name,
                "status": "failed",
                "error": str(e)
            })
    return {"results": results}

# -----------------------------
# 🔥 Fetch Scan Results (Dashboard API)
# -----------------------------
@app.get("/api/scans")
def get_scan_results(limit: int = 20):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                image_name,
                image_tag,
                registry_type,
                scan_time,
                predicted_vulnerabilities,
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
            FROM scan_results
            ORDER BY scan_time DESC
            LIMIT %s
        """, (limit,))

        return cursor.fetchall()

    finally:
        cursor.close()
        conn.close()

