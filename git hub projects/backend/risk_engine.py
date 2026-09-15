def calculate_risk(probability, features):
    altitude = features["altitude"]
    vertical_speed = features["vertical_speed"]

    if probability >= 0.75:
        risk = "HIGH"
    elif probability >= 0.30:
        risk = "CAUTION"
    else:
        risk = "LOW"

    if (altitude < 1000 and vertical_speed < -2 and probability >= 0.60):
        risk = "HIGH"

    warning = risk in ["CAUTION", "HIGH"]

    return {
        "risk_level": risk,
        "warning": warning
    }
