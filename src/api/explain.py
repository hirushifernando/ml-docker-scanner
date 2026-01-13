# src/api/explain.py

import pandas as pd

def generate_human_readable_unsupervised_text(
    row,
    anomaly_label,
    shap_row,
    feature_names,
    top_k=5
):
    shap_df = pd.DataFrame({
        "feature": feature_names,
        "value": row.values,
        "shap_value": shap_row
    })

    shap_df["abs_shap"] = shap_df["shap_value"].abs()
    shap_df = shap_df.sort_values("abs_shap", ascending=False)

    anomaly_reasons = []
    normal_reasons = []

    for _, r in shap_df.head(top_k).iterrows():
        feature = r["feature"]
        value = r["value"]
        shap_val = r["shap_value"]

        if shap_val < 0:
            anomaly_reasons.append(
                f"{feature} = {value} strongly contributed to this image being ANOMALOUS"
            )
        else:
            normal_reasons.append(
                f"{feature} = {value} reduced the anomaly risk"
            )

    output_text = f"""
Docker Image Anomaly Analysis

Final Model Decision:
This Docker image is classified as: {anomaly_label.upper()}

Primary reasons for anomaly detection:
- """ + "\n- ".join(anomaly_reasons[:3]) + f"""

Additional observations:
- """ + "\n- ".join(normal_reasons[:2]) + f"""

Interpretation:
This Docker image deviates from normal Docker image patterns
learned by the anomaly detection model.
"""

    return output_text.strip()


def generate_human_readable_text(
    row,
    predicted_vuln,
    predicted_status,
    shap_reg_row,
    shap_clf_row
):
    """
    Creates a human-readable explanation using SHAP values
    for supervised (regression + classification) models.
    """

    critical = int(row['Critical Severity'])
    high = int(row['High Severity'])
    medium = int(row['Medium Severity'])
    low = int(row['Low Severity'])

    status_text = "secure" if predicted_status == 1 else "insecure"

    reg_reasons = []
    for feature, shap_val, value in zip(row.index, shap_reg_row, row.values):
        if shap_val > 0:
            reg_reasons.append(
                f"{feature} = {value} increased vulnerability count"
            )
        elif shap_val < 0:
            reg_reasons.append(
                f"{feature} = {value} reduced vulnerability count"
            )

    clf_reasons = []
    for feature, shap_val, value in zip(row.index, shap_clf_row, row.values):
        if shap_val > 0:
            clf_reasons.append(
                f"{feature} = {value} increased insecurity risk"
            )
        elif shap_val < 0:
            clf_reasons.append(
                f"{feature} = {value} reduced insecurity risk"
            )

    return f"""
Image has an estimated {predicted_vuln:.0f} vulnerabilities:
{critical} critical, {high} high, {medium} medium, {low} low.

Regression explanation:
- {"; ".join(reg_reasons[:5])}

Classification explanation:
- {"; ".join(clf_reasons[:5])}

Final status: {status_text.upper()}
""".strip()



