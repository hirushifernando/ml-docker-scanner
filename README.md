# An Explainable Machine Learning Framework for Multi-Risk Security Assessment and Pre-Deployment Protection of Docker Images in Cloud Deployment Pipelines

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Status](https://img.shields.io/badge/Status-Research%20Project-blue)
![AI](https://img.shields.io/badge/AI-ML-green)
![Docker](https://img.shields.io/badge/Docker-Security-blue)
![ML](https://img.shields.io/badge/XGBoost-Model-orange)

This project is a Machine Learning-based Docker image security assessment system designed to detect insecure container images before deployment in cloud environments.  
The system combines supervised learning, anomaly detection, and explainable AI techniques to improve container security within CI/CD pipelines.

It demonstrates Docker image feature extraction, vulnerability prediction, anomaly detection, explainable AI integration, and automated security analysis using Python, FastAPI, and Machine Learning models.

## Features
- Docker image security assessment using Machine Learning
- Vulnerability prediction for Docker container images
- Supervised classification using XGBoost
- Anomaly detection using Isolation Forest
- Explainable AI integration using SHAP
- Automated Docker image monitoring and scanning
- REST API integration using FastAPI
- Interactive frontend dashboard for scan visualization
- Pre-deployment protection for CI/CD pipelines

## Tech Stack
- Python
- FastAPI
- XGBoost
- Isolation Forest
- SHAP
- Pandas, NumPy, Scikit-learn
- MySQL
- Docker
- Next.js

## Machine Learning Models
- XGBoost Classifier for secure/insecure image classification
- XGBoost Regressor for vulnerability prediction
- Isolation Forest for anomaly detection
- SHAP for explainable AI visualization

## Dataset Information
- Dataset size: 1,053 Docker image instances
- Includes secure and insecure Docker images
- Features include image size, layers, dependencies, package manager, and vulnerability indicators
- Data collected from Kaggle Docker security datasets and augmented synthetic samples

## Model Performance

### Regression Model (XGBoost Regressor)
- RMSE: 100.91
- R² Score: 0.84
- Cross-validation R²: 0.78

### Classification Model (XGBoost Classifier)
- Accuracy: 98.7%
- Cross-validation Accuracy: 98.39%
- Weighted F1-Score: 0.99

### Anomaly Detection (Isolation Forest)
- Detected 39 anomalous Docker images
- Used for identifying unusual container behavior and security risks

## Explainable AI (SHAP)
SHAP was integrated to explain model predictions and identify the most influential Docker image features affecting security classification and vulnerability prediction.

## Dataset Features
- Image Size
- Number of Layers
- Installed Packages
- Dependency Count
- Package Manager
- Base Image Type
- Vulnerability Severity Counts

## Research Contribution

- This research introduces an explainable Machine Learning framework for identifying insecure Docker images before cloud deployment.
- The framework improves proactive container security analysis by combining vulnerability prediction, anomaly detection, and explainable AI techniques.

## Note
- Docker images used for testing are not included in the repository.
- Dataset files and trained model files may be excluded due to size and privacy limitations.
- You can add your own Docker image datasets for testing and experimentation.
