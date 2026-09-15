def predict_microburst(features):
    score = 0.0

    if abs(features["wind_speed_change"]) >= 5:
        score += 0.20

    if abs(features["wind_speed_rate"]) >= 1:
        score += 0.25

    if abs(features["wind_direction_change"]) >= 30:
        score += 0.15

    if abs(features["wind_direction_rate"]) >= 5:
        score += 0.10

    if features["pressure_rate"] <= -0.1:
        score += 0.10

    if features["precipitation"] > 2:
        score += 0.05

    if features["humidity"] > 85:
        score += 0.05

    if features["wind_speed"] > 25:
        score += 0.10

    return round(min(score, 0.99), 2)
