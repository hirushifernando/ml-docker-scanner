# src/api/explain.py

import pandas as pd

def generate_human_readable_unsupervised_text(
    row,
    anomaly_label,
    shap_row,
    feature_names,
    top_k=5
):
    """
    Generate a human-readable explanation for anomaly detection (unsupervised).
    Returns top_k features that most influenced the anomaly decision.
    """
    shap_df = pd.DataFrame({
        "feature": feature_names,
        "value": row.values,
        "shap_value": shap_row
    })

    # Sort features by absolute SHAP value
    shap_df["abs_shap"] = shap_df["shap_value"].abs()
    shap_df = shap_df.sort_values("abs_shap", ascending=False)

    explanations = []
    for _, r in shap_df.head(top_k).iterrows():
        feature = r["feature"]
        value = r["value"]
        shap_val = r["shap_value"]

        if shap_val < 0:
            explanations.append(f"{feature} = {value} strongly contributed to this image being ANOMALOUS")
        else:
            explanations.append(f"{feature} = {value} reduced the anomaly risk")

    interpretation = (
        "This Docker image deviates from normal Docker image patterns "
        "learned by the anomaly detection model."
    )

    return "\n".join(explanations) + f"\n\nInterpretation:\n{interpretation}"


def generate_human_readable_text(
    row,
    predicted_vuln,
    predicted_status,
    shap_reg_row,
    shap_clf_row,
    top_k=5
):
    """
    Generate human-readable explanations for supervised models:
    - Regression (vulnerability count)
    - Classification (secure/insecure)
    """

    # Extract severity counts dynamically if present in row
    critical = int(row.get("Critical_Severity", 0))
    high = int(row.get("High_Severity", 0))
    medium = int(row.get("Medium_Severity", 0))
    low = int(row.get("Low_Severity", 0))

    status_text = "secure" if predicted_status == 1 else "insecure"

    # Regression explanation
    reg_reasons = []
    for feature, shap_val, value in zip(row.index, shap_reg_row, row.values):
        if shap_val > 0:
            reg_reasons.append(f"{feature} = {value} increased vulnerability count")
        elif shap_val < 0:
            reg_reasons.append(f"{feature} = {value} reduced vulnerability count")
        else:
            reg_reasons.append(f"{feature} = {value} no significant impact")
    reg_explanation = "\n".join(reg_reasons[:top_k])

    # Classification explanation
    clf_reasons = []
    for feature, shap_val, value in zip(row.index, shap_clf_row, row.values):
        if shap_val > 0:
            clf_reasons.append(f"{feature} = {value} increased insecurity risk")
        elif shap_val < 0:
            clf_reasons.append(f"{feature} = {value} reduced insecurity risk")
        else:
            clf_reasons.append(f"{feature} = {value} no significant impact")
    clf_explanation = "\n".join(clf_reasons[:top_k])

    # Final interpretation
    interpretation = (
        "This Docker image deviates from normal patterns learned by the supervised "
        "models. It has been deemed "
        f"{status_text.upper()} by the ML-based scanner."
    )

    return f"""
Image has an estimated {predicted_vuln:.0f} vulnerabilities:
{critical} critical, {high} high, {medium} medium, {low} low.

Regression explanation:
{reg_explanation}

Classification explanation:
{clf_explanation}

Interpretation:
{interpretation}
""".strip()
