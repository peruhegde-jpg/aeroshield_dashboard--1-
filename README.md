# AEROSHIELD
### Affordable Early Warning System for Atmospheric Microburst Risk to Aircraft

> [!IMPORTANT]
> **OPERATIONAL DISCLAIMER:**  
> **This is a prototype demonstration using simulated/experimental data. It is not validated or certified for operational aviation use.**

---

## 1. What AeroShield Does

**AeroShield** is a real-time command-center web application designed to demonstrate an affordable, proactive early warning system for low-altitude convective wind shear and microburst encounters.

Unlike high-cost airborne Doppler radar systems, AeroShield leverages:
1. **Aircraft Telemetry Streams**: In-flight GPS coordinates, altitude AGL, airspeed, and heading.
2. **In-situ / Surface Meteorological Data**: Ambient temperature, relative humidity gradient, barometric pressure tendencies, and wind vectors.
3. **Machine Learning Predictive Classifier**: An ensemble Random Forest model estimating instantaneous microburst probability before hazardous downdrafts penetrate flight corridors.
4. **Multi-Parametric Risk Engine**: Transparent geodesic trajectory vector calculations computing distance, bearing, convergence angle, and estimated time-to-encounter (TTE).

When risk criteria exceed safety thresholds, AeroShield triggers synchronized **visual cockpit warnings** and **Web Audio synthesized audio alarms** to assist situational awareness.

---

## 2. System Architecture

```
                               ┌─────────────────────────────┐
                               │     Atmospheric Sensors     │
                               │ (Temp, RH, Pres, Wind, Rain)│
                               └──────────────┬──────────────┘
                                              │
                                              ▼
┌─────────────────────────┐    ┌─────────────────────────────┐
│    Aircraft Telemetry   │    │    Random Forest Model      │
│  (Pos, Hdg, Spd, Alt)   │    │  (Microburst Probability %) │
└────────────┬────────────┘    └──────────────┬──────────────┘
             │                                │
             └────────────────┬───────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │         Risk Engine          │
               │  - Haversine Distance        │
               │  - Forward Bearing           │
               │  - Heading Deviation Vector  │
               │  - Time-to-Encounter (TTE)   │
               └──────────────┬───────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │    Multi-Level Risk Logic    │
               │      LOW / CAUTION / HIGH    │
               └──────────────┬───────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────────┐
│ Cockpit HUD  │      │ Visual Alert │      │ Synthesized Audio│
│ Tactical Map │      │ Alarm Banner │      │ Chimes / Sirens  │
└──────────────┘      └──────────────┘      └──────────────────┘
```

### Component Structure:
- **`src/config/riskConfig.js`**: Centralized configurable risk thresholds, hazard centroid, and default parameters.
- **`src/logic/geoCalculations.js`**: Geodesic spherical trigonometry (Haversine formula, forward Great Circle azimuth bearing, angular vector difference, TTE closing rate).
- **`src/logic/riskEngine.js`**: Multi-parametric risk state classifier with explainability reasoning.
- **`src/logic/audioAlerts.js`**: Cockpit audio alerts synthesized via the HTML5 Web Audio API (100% offline, zero external audio asset dependencies).
- **`src/logic/csvParser.js`**: CSV dataset parser and stream synchronizer.
- **`src/data/demoDataset.js`**: 78-step coherent simulation dataset spanning 4 flight phases.
- **`src/data/mlValidationStats.js`**: Benchmark evaluation results (89.8% accuracy, confusion matrix, feature importances).
- **`src/components/`**: Modular cockpit HUD panels (Tactical Radar, Telemetry, Weather, Probability Chart, Risk Decision Panel, Event Log, Track Replay, CSV Ingestion, and Settings).

---

## 3. How to Install

Ensure you have **Node.js (v18+)** and **npm** installed.

```bash
# Clone or navigate to the project directory
cd aeroshield

# Install dependencies
npm install
```

---

## 4. How to Run

```bash
# Start the local Vite development server
npm run dev
```

Open your browser at `http://localhost:5173`.

To create a production build:
```bash
npm run build
npm run preview
```

---

## 5. How Demo Mode Works

AeroShield includes a built-in **78-step synchronized flight demonstration** near a simulated microburst cell in the northern sector (Lat 28.7041°N, Lon 77.1025°E):

- **Phase 1 (Steps 1–22) — Nominal Sector Entry**:
  Aircraft cruises at 124 kt, 1550 m AGL. Weather is clear, ML probability is low (4–19%), distance > 22 km. Risk: **LOW**.
- **Phase 2 (Steps 23–44) — Convective Front Convergence**:
  Atmospheric conditions deteriorate (humidity surges from 54% to 81%, pressure drops, wind gusts rise to 17 m/s, rain starts). Aircraft heading aligns with hazard, distance shrinks to 7 km, ML probability reaches 68%. Risk: **CAUTION**.
- **Phase 3 (Steps 45–62) — Microburst Encounter & Evasive Turn**:
  Aircraft approaches/intersects outer hazard perimeter (distance drops to 1.8 km). Peak cold downdraft pool (21.4°C), meso-low pressure drop (996.9 hPa), wind shear spikes to 28.7 m/s (56 kt). ML probability reaches 96.8%. Risk: **HIGH** (Master Warning Banner flashes, rapid audio siren pulses). Pilot executes evasive breakout turn.
- **Phase 4 (Steps 63–78) — Breakout Climb & Recovery**:
  Aircraft accelerates to 140 kt and climbs to 1660 m AGL away from the cell. Pressure recovers, wind subsides, ML probability drops to 4%. Risk transitions back to **LOW**.

---

## 6. Data Formats

AeroShield accepts CSV uploads in either a **Single Unified CSV** or **Three Separate CSV Files**:

### A) Single Unified CSV (`unified_dataset.csv`):
```csv
timestamp,latitude,longitude,altitude,heading,airspeed,temperature,humidity,pressure,wind_speed,wind_direction,rain,microburst_probability,predicted_class
08:50:00,28.42000,76.88000,1550,38,124,32.5,42.0,1012.4,4.5,180,"No",4.5,NORM
...
```

### B) Separate CSV Files:
1. **`aircraft_data.csv`**:
   `timestamp, latitude, longitude, altitude, heading, airspeed`
2. **`weather_data.csv`**:
   `timestamp, temperature, humidity, pressure, wind_speed, wind_direction, rain`
3. **`ml_predictions.csv`**:
   `timestamp, microburst_probability, predicted_class`

Sample template files can be downloaded directly from the **LOAD CSV** modal in the top navigation bar.

---

## 7. Risk Engine Logic & Formulas

The risk engine runs instantaneously on each time-step using the following mathematical formulations:

### A) Geodesic Distance (Haversine Formula):
$$\Delta\phi = \phi_2 - \phi_1, \quad \Delta\lambda = \lambda_2 - \lambda_1$$
$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$d = 2 R \arctan2\left(\sqrt{a}, \sqrt{1-a}\right)$$
*(where $R = 6371.0\text{ km}$)*

### B) Forward Azimuth Bearing to Hazard:
$$\theta = \arctan2\left(\sin(\Delta\lambda)\cos(\phi_2), \; \cos(\phi_1)\sin(\phi_2) - \sin(\phi_1)\cos(\phi_2)\cos(\Delta\lambda)\right)$$

### C) Heading Alignment Tolerance:
$$\Delta\text{heading} = \min\left(|\psi - \theta|, 360^\circ - |\psi - \theta|\right)$$
Aircraft is considered heading toward hazard if $\Delta\text{heading} \le \text{Threshold}_{\text{angle}}$ (default $55^\circ$).

### D) Time-to-Encounter (TTE):
$$\text{TTE (seconds)} = \frac{d}{V_{\text{closing}}}$$
where $V_{\text{closing}} = V_{\text{airspeed}} \times \max(0.2, \cos(\Delta\text{heading}))$.

### E) Risk Classification Rules:
- **HIGH RISK**:
  - $d \le \text{Hazard Radius}$ **OR**
  - $[\text{ML Prob} \ge 75\%] \land [\text{Heading Toward Hazard} = \text{YES}] \land ([d \le 5.0\text{ km}] \lor [\text{TTE} \le 45\text{s}])$
- **CAUTION RISK**:
  - $[\text{ML Prob} \ge 45\%] \land [\text{Heading Toward Hazard} = \text{YES}] \land ([d \le 15.0\text{ km}] \lor [\text{TTE} \le 150\text{s}])$
  - OR $[\text{ML Prob} \ge 75\%] \land [d \le 15.0\text{ km}]$
- **LOW RISK**:
  - All other conditions (nominal separation or diverging vector).

---

## 8. How to Connect Real Data Later

To connect real IoT weather stations, ADS-B receivers, or live ML inference servers:
1. **REST API / Polling Mode**:
   Fetch telemetry and predictions from a backend endpoint and pass them into `processUnifiedDataset()`.
2. **WebSocket Stream Mode**:
   Subscribe to MQTT or WebSocket telemetry events and append incoming samples directly into the replay dataset array.
3. **Custom Model Deployment**:
   Export your trained Python scikit-learn model as ONNX or TensorFlow.js, or run real-time inference on an edge gateway feeding the CSV / JSON pipeline.

---

## 9. Limitations

1. **Experimental Prototype**: Built for hackathon demonstration and academic validation.
2. **2D Projection Approximations**: Utilizes Great Circle spherical trigonometry; complex 3D downdraft glide-slope wind field dynamics are simulated.
3. **No Certification**: Not approved by the FAA, EASA, or DGCA for operational navigation or flight dispatch.
