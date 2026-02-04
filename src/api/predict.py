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
        raw_prediction = reg_model.predict(X_reg)[0]
        vulnerability_count = max(0, round(raw_prediction))

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

        anomaly_label = "anomalous" if anomaly_result == -1 else "normal"

        unsupervised_explanation = generate_human_readable_unsupervised_text(
            row=X_unsup.iloc[0],
            anomaly_label=anomaly_label,
            shap_row=shap_unsup,
            feature_names=X_unsup.columns
        )

        # -------- Decision --------
        return {
            "image_name": image_name,

            # ----- supervised -----
            "secure_prediction": secure_prediction,  # 1 = secure, 0 = not secure
            "predicted_vulnerabilities": vulnerability_count,

            # ----- anomaly -----
            "anomaly_prediction": anomaly_result,  # -1 = anomaly, 1 = normal

            # ----- explanations -----
            "supervised_explanation": supervised_explanation,
            "unsupervised_explanation": unsupervised_explanation
        }

    except Exception as e:
        return {
            "error": str(e),
            "message": "Docker image scan failed"
        }
