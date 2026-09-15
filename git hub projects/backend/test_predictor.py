from backend.predictor import predict_microburst

normal = {
    "wind_speed": 8,
    "wind_direction": 180,
    "temperature": 29,
    "humidity": 55,
    "pressure": 1010,
    "precipitation": 0,

    "altitude": 5000,
    "ias": 75,
    "vertical_speed": 1,
    "heading": 180,

    "wind_speed_change": 0.5,
    "wind_direction_change": 2,
    "pressure_change": 0,
    "temperature_change": 0,

    "wind_speed_rate": 0.1,
    "wind_direction_rate": 0.4,
    "pressure_rate": 0
}

dangerous = {
    "wind_speed": 32,
    "wind_direction": 250,
    "temperature": 27,
    "humidity": 92,
    "pressure": 1004,
    "precipitation": 8,

    "altitude": 500,
    "ias": 65,
    "vertical_speed": -5,
    "heading": 245,

    "wind_speed_change": 12,
    "wind_direction_change": 50,
    "pressure_change": -3,
    "temperature_change": -1,

    "wind_speed_rate": 2.4,
    "wind_direction_rate": 10,
    "pressure_rate": -0.6
}

print("==================================================")
print("  AEROSHIELD PERSON 5 PREDICTOR TEST")
print("==================================================")
print("Normal Flight Condition Score:")
print(predict_microburst(normal))

print()
print("Dangerous Microburst Condition Score:")
print(predict_microburst(dangerous))
print("==================================================")
