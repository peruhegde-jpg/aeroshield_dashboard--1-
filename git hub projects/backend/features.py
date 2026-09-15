def calculate_features(current, previous=None):
    features = {
        "wind_speed": current["wind_speed"],
        "wind_direction": current["wind_direction"],
        "temperature": current["temperature"],
        "humidity": current["humidity"],
        "pressure": current["pressure"],
        "precipitation": current["precipitation"],
        "altitude": current["altitude"],
        "ias": current["ias"],
        "vertical_speed": current["vertical_speed"],
        "heading": current["heading"],
        "latitude": current.get("latitude", 28.7218),
        "longitude": current.get("longitude", 77.1000),
        "wind_speed_change": 0.0,
        "wind_direction_change": 0.0,
        "pressure_change": 0.0,
        "temperature_change": 0.0,
        "wind_speed_rate": 0.0,
        "wind_direction_rate": 0.0,
        "pressure_rate": 0.0
    }

    if previous is None:
        return features

    features["wind_speed_change"] = current["wind_speed"] - previous["wind_speed"]
    features["pressure_change"] = current["pressure"] - previous["pressure"]
    features["temperature_change"] = current["temperature"] - previous["temperature"]

    direction_difference = current["wind_direction"] - previous["wind_direction"]
    features["wind_direction_change"] = ((direction_difference + 180) % 360) - 180

    c_ts = current["timestamp"]
    p_ts = previous["timestamp"]
    time_difference = (c_ts - p_ts).total_seconds() if hasattr(c_ts, 'total_seconds') else 1.0

    if time_difference > 0:
        features["wind_speed_rate"] = features["wind_speed_change"] / time_difference
        features["wind_direction_rate"] = features["wind_direction_change"] / time_difference
        features["pressure_rate"] = features["pressure_change"] / time_difference

    return features
