from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import mysql.connector
from mysql.connector import Error
import json

from .predict import scan_image

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
    allow_origins=["*"],  # later restrict to frontend URL
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
            user="root",
            password="yourpassword",
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
                id,
                image_name,
                registry_type,
                scan_time,
                vulnerabilities,
                anomaly_detected,
                severity,
                decision,
                supervised_explanation,
                regression_explanation,
                classification_explanation,
                unsupervised_explanation,
                model_decision,
                ml_timestamp
            FROM scan_results
            ORDER BY scan_time DESC
            LIMIT %s
        """, (limit,))

        results = cursor.fetchall()
        return results

    except Error as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()
