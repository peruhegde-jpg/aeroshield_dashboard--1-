from datetime import datetime

MAX_TIME_DIFFERENCE = 2.0

def synchronize(sensor, aircraft):
    if sensor is None or aircraft is None:
        return None

    s_ts = sensor.timestamp if isinstance(sensor.timestamp, datetime) else datetime.fromisoformat(str(sensor.timestamp))
    a_ts = aircraft.timestamp if isinstance(aircraft.timestamp, datetime) else datetime.fromisoformat(str(aircraft.timestamp))

    time_difference = abs((s_ts - a_ts).total_seconds())

    if time_difference > MAX_TIME_DIFFERENCE:
        return None

    return {
        "timestamp": s_ts,
        "wind_speed": sensor.wind_speed,
        "wind_direction": sensor.wind_direction,
        "temperature": sensor.temperature,
        "humidity": sensor.humidity,
        "pressure": sensor.pressure,
        "precipitation": sensor.precipitation,
        "latitude": aircraft.latitude,
        "longitude": aircraft.longitude,
        "altitude": aircraft.altitude,
        "ias": aircraft.ias,
        "vertical_speed": aircraft.vertical_speed,
        "heading": aircraft.heading
    }
