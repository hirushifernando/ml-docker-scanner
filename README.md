# An Explainable Machine Learning Framework for Multi-Risk Security Assessment and Pre-Deployment Protection of Docker Images in Cloud Deployment Pipelines

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

## Research Contribution

This research introduces an explainable Machine Learning framework for identifying insecure Docker images before cloud deployment.
The framework improves proactive container security analysis by combining vulnerability prediction, anomaly detection, and explainable AI techniques.

## Note
Docker images used for testing are not included in the repository.
Dataset files and trained model files may be excluded due to size and privacy limitations.
You can add your own Docker image datasets for testing and experimentation.

```bash
git clone https://github.com/yourusername/docker-image-security-ml-framework.git
cd docker-image-security-ml-framework
