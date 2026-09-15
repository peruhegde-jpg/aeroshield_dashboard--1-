# AEROSHIELD - TEAM DATA CONTRACTS & INTEGRATION SPECIFICATIONS
### Team Coordination Guide for Hackathon Project (Deadline: 29 August 2026)

This document establishes the exact data exchange formats, column names, and pipeline contracts between all 6 team members so everyone can work in parallel without blocking each other.

---

## Team Role Map & Dependency Graph

```
┌─────────────────────────┐         ┌─────────────────────────┐
│        PERSON 1         │         │        PERSON 2         │
│   Hardware & Sensors    │         │   Aircraft Simulation   │
│   (ESP32 In-situ Met)   │         │    (JSBSim Flight)      │
└────────────┬────────────┘         └────────────┬────────────┘
             │ (Raw Sensor CSV)                  │ (Flight Telemetry CSV)
             │                                   │
             └─────────────────┬─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      PERSON 3       │
                    │  Data Engineering   │
                    │  (Merge & Clean)    │
                    └──────────┬──────────┘
                               │ (Clean Feature Streams)
                               ├────────────────────────┐
                               │                        │
                               ▼                        ▼
                    ┌─────────────────────┐  ┌─────────────────────┐
                    │      PERSON 4       │  │      PERSON 5       │
                    │  ML & Data Science  │  │ System Integration  │
                    │  (Random Forest)    │  │  (Real-Time Bridge) │
                    └──────────┬──────────┘  └──────────┬──────────┘
                               │ (ML Probabilities)     │
                               └──────────┬─────────────┘
                                          │
                                          ▼
                               ┌─────────────────────┐
                               │      PERSON 6       │
                               │ UI, Alerts & Docs   │
                               │ (AeroShield HUD)    │
                               └─────────────────────┘
```

---

## 1. Person 1 Deliverable Contract (Hardware & Sensors)

### Output File: `weather_data.csv` (or MQTT/Serial stream)
Person 1's ESP32 system measures surface/atmospheric parameters and emits:

| Column Header | Data Type | Units / Range | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `timestamp` | String / Time | `HH:MM:SS` or Unix ms | Local sample timestamp | `08:50:00` |
| `temperature` | Float | °C (-10.0 to 50.0) | Ambient air temperature (BMP280/DHT22) | `32.5` |
| `humidity` | Float | % RH (0.0 to 100.0) | Relative ambient humidity | `42.0` |
| `pressure` | Float | hPa (900.0 to 1050.0) | Barometric surface pressure | `1012.4` |
| `wind_speed` | Float | m/s (0.0 to 45.0) | Anemometer horizontal wind speed | `4.5` |
| `wind_direction`| Integer | Degrees (0 to 359) | Wind vane direction azimuth | `180` |
| `rain` | String / Float| Text or mm/hr | Rain sensor status / intensity | `"No"` or `"Light Rain"` |

---

## 2. Person 2 Deliverable Contract (Aircraft Simulation)

### Output File: `aircraft_data.csv`
Person 2's JSBSim flight simulator exports flight dynamics:

| Column Header | Data Type | Units / Range | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `timestamp` | String / Time | `HH:MM:SS` | Synchronized flight timestamp | `08:50:00` |
| `latitude` | Float | Decimal Deg (-90 to +90) | Aircraft GPS Latitude | `28.42000` |
| `longitude` | Float | Decimal Deg (-180 to +180)| Aircraft GPS Longitude | `76.88000` |
| `altitude` | Integer | Meters AGL (0 to 10000) | Altitude Above Ground Level | `1550` |
| `heading` | Integer | Degrees (0 to 359) | True magnetic/geodesic heading | `38` |
| `airspeed` | Integer | Knots (IAS, 0 to 400) | Indicated Airspeed | `124` |

---

## 3. Person 3 Deliverable Contract (Data Engineering)

### Output File: `unified_dataset.csv`
Person 3 merges the telemetry, weather, and ML features using timestamp alignment and sliding-window feature engineering (e.g. `humidity_change`, `wind_speed_roll_std`).

#### Unified CSV Schema:
```csv
timestamp,latitude,longitude,altitude,heading,airspeed,temperature,humidity,pressure,wind_speed,wind_direction,rain,microburst_probability,predicted_class
08:50:00,28.42000,76.88000,1550,38,124,32.5,42.0,1012.4,4.5,180,"No",4.5,NORM
```

---

## 4. Person 4 Deliverable Contract (ML & Data Science)

### Deliverables:
1. **Trained Model**: Serialized scikit-learn Random Forest model (`microburst_rf_model.pkl` / ONNX format).
2. **`ml_predictions.csv`**:
   | Column Header | Data Type | Example |
   | :--- | :--- | :--- |
   | `timestamp` | String | `08:50:00` |
   | `microburst_probability` | Float (0.0 to 100.0) | `84.1` |
   | `predicted_class` | String (`NORM`, `WET`, `DRY`) | `WET` |
3. **Model Performance Summary** (for UI Validation panel & Report):
   - Benchmark: Accuracy **89.8%** (167 / 186 test samples)
   - Confusion Matrix counts (`NORM`, `WET`, `DRY`)
   - Top Gini Feature Importances (`humidity_change`: 28%, `precipitation`: 22%, `humidity`: 18%, `wind_speed_roll_std`: 14%, `wind_speed`: 11%, `wind_speed_rate`: 7%)

---

## 5. Person 5 Deliverable Contract (System Integration)

### Deliverables:
- Bridge script (Python FastAPI / Flask / Node.js MQTT broker) reading serial data from Person 1's ESP32, fetching JSBSim flight telemetry from Person 2, querying Person 4's model, and outputting to Person 6's dashboard via CSV upload or WebSocket/REST API.

---

## 6. Person 6 Deliverables (You: UI, Alerts & Documentation)

### Deliverables:
1. **AeroShield Web Dashboard**: Fully working, responsive command-center UI with 360° Radar, Leaflet Map, Telemetry instruments, Weather panel, Probability charts, Geodesic Risk Engine, Web Audio alarms, and CSV loaders.
2. **Pitch Deck Presentation (PPT/Slides)**: Complete 10-slide deck covering problem, architecture, ML results, and live demo.
3. **Technical Report**: Comprehensive academic/hackathon report.
4. **Demo Video Walkthrough Script**: 3-minute scripted presentation.
