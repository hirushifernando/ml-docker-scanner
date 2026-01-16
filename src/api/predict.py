import joblib
import shap
from pathlib import Path
from ..preprocess import preprocess_supervised, preprocess_unsupervised
from .docker_feature_extractor import extract_features_from_image
from .explain import (
    generate_human_readable_text,
    generate_human_readable_unsupervised_text
)

# ---------- Load models ----------
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR.parent / "model_store"

clf_model = joblib.load(MODEL_DIR / "xgb_clf_model.pkl")
reg_model = joblib.load(MODEL_DIR / "xgb_reg_model.pkl")
iso_model = joblib.load(MODEL_DIR / "isolation_forest.pkl")

explainer_reg = shap.Explainer(reg_model)
explainer_clf = shap.Explainer(clf_model)
explainer_unsup = shap.TreeExplainer(iso_model)


def scan_image(image_name: str):
    """
    Scan Docker image by name.
    """
    try:
        # -------- Extract features --------
        input_data = extract_features_from_image(image_name)

        # -------- Supervised --------
        X_clf = preprocess_supervised(image_name, task="classification")
        X_reg = preprocess_supervised(image_name, task="regression")

        secure_prediction = int(clf_model.predict(X_clf)[0])
        vulnerability_count = int(reg_model.predict(X_reg)[0])

        # -------- Unsupervised --------
        X_unsup = preprocess_unsupervised(image_name)
        anomaly_result = int(iso_model.predict(X_unsup)[0])

        # -------- SHAP --------
        shap_reg = explainer_reg(X_reg).values[0]
        shap_clf = explainer_clf(X_clf).values[0]
        shap_unsup = explainer_unsup.shap_values(X_unsup)[0]

        supervised_explanation = generate_human_readable_text(
            row=X_clf.iloc[0],
            predicted_vuln=vulnerability_count,
            predicted_status=secure_prediction,
            shap_reg_row=shap_reg,
            shap_clf_row=shap_clf
        )

        classification_explanation = [
            f"{k} = {v:.2f} increased insecurity risk"
            for k, v in zip(X_clf.columns, shap_clf)
        ]


        unsupervised_explanation = generate_human_readable_unsupervised_text(
            row=X_unsup.iloc[0],
            anomaly_label="ANOMALY" if anomaly_result == -1 else "NORMAL",
            shap_row=shap_unsup,
            feature_names=X_unsup.columns
        )


        # -------- Decision --------
        if anomaly_result == -1 or secure_prediction == 0:
            decision = "DENY"
            model_decision = "NOT SECURE"
            severity = "HIGH"
        else:
            decision = "ALLOW"
            model_decision = "SECURE"
            severity = "LOW"

        # -------- Interpretation text --------
        interpretation = (
            "This Docker image deviates from normal Docker image patterns learned by the detection model. "
            f"It has been deemed {model_decision} by the ML-based scanner."
        )

        return {
            "image_name": image_name,
            "image_tag": image_name.split(":")[-1] if ":" in image_name else None,
            "predicted_vulnerabilities": vulnerability_count,
            "critical_count": 0,  # You can fill if your regression model outputs
            "high_count": 0,
            "medium_count": 0,
            "low_count": 0,
            "decision": decision,
            "severity": severity,
            "supervised_explanation": supervised_explanation,  # list of strings
            "classification_explanation": classification_explanation,
            "unsupervised_explanation": unsupervised_explanation,
            "interpretation": interpretation,
            "model_decision": model_decision,
        }

    except Exception as e:
        return {
            "error": str(e),
            "message": "Docker image scan failed"
        }
