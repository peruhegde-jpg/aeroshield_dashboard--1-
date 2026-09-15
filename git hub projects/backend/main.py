import asyncio
from datetime import datetime, timezone
import math
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.models import SensorData, AircraftData
from backend.synchronization import synchronize
from backend.pipeline import process_observation
from backend.predictor import predict_microburst
from backend.risk_engine import calculate_risk

app = FastAPI(title="AeroShield Backend")

# Enable CORS for frontend dashboard access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

latest_sensor = None
latest_aircraft = None
synchronized_history = []
latest_result = None

@app.get("/")
def home():
    return {
        "system": "AeroShield",
        "status": "running"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

@app.post("/sensor")
def receive_sensor(data: SensorData):
    global latest_sensor
    latest_sensor = data
    return {
        "status": "received",
        "node_id": data.node_id,
        "timestamp": data.timestamp
    }

@app.post("/aircraft")
def receive_aircraft(data: AircraftData):
    global latest_aircraft
    latest_aircraft = data
    return {
        "status": "received",
        "aircraft_id": data.aircraft_id,
        "timestamp": data.timestamp
    }

@app.get("/current-data")
def current_data():
    return {
        "sensor": latest_sensor,
        "aircraft": latest_aircraft
    }

@app.get("/synchronized-data")
def get_synchronized_data():
    synchronized = synchronize(latest_sensor, latest_aircraft)
    if synchronized is None:
        return {
            "status": "waiting",
            "message": "Sensor and aircraft data are not synchronized yet."
        }
    return {
        "status": "synchronized",
        "data": synchronized
    }

@app.get("/features")
def get_features():
    features = process_observation(latest_sensor, latest_aircraft, synchronized_history)
    if features is None:
        return {
            "status": "waiting",
            "message": "Sensor and aircraft data are not synchronized yet."
        }
    return {
        "status": "success",
        "features": features
    }

@app.get("/predict")
def predict():
    global latest_result
    features = process_observation(latest_sensor, latest_aircraft, synchronized_history)
    if features is None:
        return {
            "status": "waiting",
            "message": "Sensor and aircraft data are not synchronized yet."
        }

    probability = predict_microburst(features)
    risk = calculate_risk(probability, features)

    latest_result = {
        "features": features,
        "probability": probability,
        "risk": risk
    }

    return {
        "status": "success",
        "microburst_probability": probability,
        "risk": risk,
        "features": features
    }

@app.get("/alert")
def get_alert():
    # If no prediction has occurred yet, run predict() on current data
    if latest_result is None or latest_sensor is None:
        predict()

    if latest_result is None:
        return {
            "status": "waiting",
            "message": "No prediction available yet."
        }

    features = latest_result["features"]
    probability = latest_result["probability"]
    risk = latest_result["risk"]

    if risk["risk_level"] == "HIGH":
        message = "HIGH MICROBURST RISK"
    elif risk["risk_level"] == "CAUTION":
        message = "MICROBURST CONDITIONS DEVELOPING"
    else:
        message = "NO SIGNIFICANT MICROBURST RISK"

    return {
        "status": "success",
        "microburst_probability": probability,
        "risk_level": risk["risk_level"],
        "warning": risk["warning"],
        "message": message,
        "aircraft": {
            "latitude": features.get("latitude", 28.7218),
            "longitude": features.get("longitude", 77.1000),
            "altitude": features["altitude"],
            "ias": features["ias"],
            "vertical_speed": features["vertical_speed"],
            "heading": features["heading"]
        },
        "atmosphere": {
            "wind_speed": features["wind_speed"],
            "wind_direction": features["wind_direction"],
            "temperature": features["temperature"],
            "humidity": features["humidity"],
            "pressure": features["pressure"],
            "precipitation": features["precipitation"]
        },
        "indicators": {
            "rapid_wind_change": abs(features["wind_speed_rate"]) >= 1,
            "rapid_direction_change": abs(features["wind_direction_rate"]) >= 5,
            "falling_pressure": features["pressure_rate"] < -0.1
        },
        "features": features
    }

# ============================================================
# AUTOMATIC 1 HZ LIVE FEEDER (Keeps data streaming seamlessly)
# ============================================================
sim_step = 0

async def live_simulation_feeder():
    global sim_step, latest_sensor, latest_aircraft
    await asyncio.sleep(1)
    
    while True:
        sim_step += 1
        now = datetime.now()
        
        # Flight scenario dynamics
        progress = (sim_step % 120) / 120.0
        is_hazard_zone = 40 <= (sim_step % 120) <= 85
        
        # Aircraft coordinates approach path
        lat = 28.7450 - (progress * 0.035) + 0.005 * math.sin(progress * 6)
        lon = 77.0850 + (progress * 0.030) + 0.005 * math.cos(progress * 6)
        alt = max(200, 3000 - (sim_step % 120) * 22)
        ias = 85.0 - (15.0 if is_hazard_zone else 0.0) + 2.0 * math.sin(sim_step * 0.2)
        vs = -4.5 if is_hazard_zone else -1.5
        hdg = int((135 + 15 * math.sin(progress * 4)) % 360)

        # Atmosphere dynamics
        wspd = 28.0 if is_hazard_zone else (8.0 + 3.0 * math.sin(sim_step * 0.1))
        wdir = int((240 + 40 * math.sin(sim_step * 0.15)) % 360)
        temp = 25.0 if is_hazard_zone else 29.0
        hum = 92.0 if is_hazard_zone else 58.0
        pres = 998.0 if is_hazard_zone else 1012.0
        precip = 12.0 if is_hazard_zone else 0.0

        latest_sensor = SensorData(
            timestamp=now,
            node_id="ESP32-NODE-01",
            wind_speed=round(wspd, 1),
            wind_direction=wdir,
            temperature=round(temp, 1),
            humidity=round(hum, 1),
            pressure=round(pres, 1),
            precipitation=round(precip, 1)
        )

        latest_aircraft = AircraftData(
            timestamp=now,
            aircraft_id="VT-AS101",
            latitude=round(lat, 5),
            longitude=round(lon, 5),
            altitude=round(alt, 1),
            ias=round(ias, 1),
            vertical_speed=round(vs, 1),
            heading=hdg
        )

        # Run pipeline
        predict()
        await asyncio.sleep(1.0)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(live_simulation_feeder())
