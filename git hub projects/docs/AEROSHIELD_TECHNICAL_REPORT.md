# AEROSHIELD: Affordable Early Warning System for Atmospheric Microburst Risk to Aircraft
## Comprehensive Technical & Validation Report

---

## 1. Executive Summary & Problem Formulation
Low-altitude atmospheric microbursts and convective wind-shear events represent one of the most hazardous meteorological threats to transport-category and general aviation aircraft during critical approach, landing, and departure phases. A microburst is characterized by an intense, localized column of sinking air (downdraft) that hits the ground and radiates outward in all directions. When an aircraft penetrates a microburst during final approach, it initially experiences a performance-increasing headwind (climb tendency), followed immediately by a severe downdraft and a sudden, catastrophic tailwind shear leading to loss of airspeed, abrupt loss of lift, and ground impact before recovery can be initiated.

Traditional airport warning infrastructures—such as Terminal Doppler Weather Radar (TDWR) and extensive Low-Level Windshear Alert Systems (LLWAS)—cost upwards of millions of dollars to deploy and maintain, leaving regional airfields, temporary strips, and cost-constrained operators unprotected. 

**AeroShield** delivers an affordable, real-time terminal-area microburst early warning system. By fusing low-cost ground atmospheric sensor telemetry (sampling at 1 Hz) with aircraft-state flight dynamics and a specialized **Random Forest / XGBoost machine learning classifier**, AeroShield evaluates aircraft-specific geometric hazard convergence, computes precise Time-to-Encounter (TTE), and synthesizes multi-stage cockpit audio-visual warnings before dangerous shear penetration occurs.

---

## 2. Multi-Tier System Architecture & Work Division
The project is built by a 6-member distributed engineering team:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               AEROSHIELD SYSTEM PIPELINE                               │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [PERSON 1: ESP32 Sensing Node]           [PERSON 2: JSBSim 60-min Telemetry]
  • 1 Hz Temp, Hum, Pres, Wind             • 1 Hz Lat, Lon, Alt, IAS, VS, Dynamic Deltas
               │                                            │
               └─────────────────────┬──────────────────────┘
                                     ▼
                      [PERSON 3: Data Engineering Pipeline]
                      • 2.0s Temporal Window Synchronization
                      • Dynamic Rate Calculation (ΔIAS, ΔVS, ΔWind)
                                     │
                                     ▼
                      [PERSON 4: 4-Class ML Classifier]
                      • RandomForest (100 Trees) & XGBoost
                      • Features: wind_speed_kt, ias, agl_ft, vs_fpm, delta_ias, delta_vs_fpm...
                      • Classes: NORMAL, PRE-DISTURBANCE, RECOVERY, MICROBURST
                                     │
                                     ▼
                      [PERSON 5: Real-Time FastAPI Bridge]
                      • Endpoints: POST /sensor, POST /aircraft, GET /alert
                      • Circular Wind Vector Mathematics
                                     │
                                     ▼
                      [PERSON 6: Web Command Dashboard & Alerts]
                      • 360° Tactical Radar & Geo-Track Replay
                      • Geodesic Haversine / Bearing / TTE Risk Engine
                      • Web Audio API Synthesized Cockpit Warnings
```

---

## 3. Mathematical Risk Engine & Hazard Formulations

### 3.1 Geodesic Great-Circle Distance (Haversine Formula)
Given aircraft position \((\phi_1, \lambda_1)\) and microburst core \((\phi_2, \lambda_2)\):

\[
a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)
\]
\[
d = 2 \cdot R \cdot \arctan2\left(\sqrt{a}, \sqrt{1-a}\right) \quad (\text{where } R = 6371\text{ km})
\]

### 3.2 True Bearing & Heading Convergence Angle
\[
\theta = \arctan2\left(\sin(\Delta \lambda)\cos(\phi_2), \; \cos(\phi_1)\sin(\phi_2) - \sin(\phi_1)\cos(\phi_2)\cos(\Delta \lambda)\right)
\]
\[
\Delta \text{heading} = |(\theta - \psi + 180^\circ \pmod{360^\circ}) - 180^\circ|
\]
An aircraft is defined as **converging** on the hazard cell if \(\Delta \text{heading} \le 55^\circ\).

### 3.3 Dynamic Time-to-Encounter (TTE)
\[
\text{TTE} = \frac{d}{v_{\text{closure}}} = \frac{d}{v_{\text{ground}} \cdot \cos(\Delta \text{heading})}
\]

### 3.4 Multi-Level Deterministic Risk Classification
- **HIGH (Master Warning / Continuous Pulse)**:
  \(\text{Probability} \ge 75\% \land d \le 8.0\text{ km} \land \text{Converging}\) OR \(\text{TTE} \le 120\text{ s}\) OR \((\text{Alt} < 1000\text{ ft} \land \text{VS} < -200\text{ fpm} \land \text{Prob} \ge 60\%)\).
- **CAUTION (Advisory Chime)**:
  \(\text{Probability} \ge 30\% \land d \le 15.0\text{ km} \land \text{Converging}\) OR \(\text{TTE} \le 300\text{ s}\).
- **LOW (Normal Operations)**:
  \(\text{Probability} < 30\%\) OR Diverging Flight Path OR \(d > 15.0\text{ km}\).

---

## 4. Person 4 Machine Learning Model Validation Results

### 4.1 Training Specification
- **Algorithm:** `RandomForestClassifier(n_estimators=100, random_state=42)` / `XGBClassifier`
- **Dataset:** 60-minute, 1 Hz flight trajectory simulation (`aircraft_telemetry_60min.csv`)
- **Holdout Evaluation Split:** 20% Stratified Holdout (`721 samples`)

### 4.2 Feature Set (8 Core Telemetry Variables)
1. `wind_speed_kt`: Atmospheric surface wind speed (knots)
2. `wind_direction_deg`: Wind vector direction (degrees)
3. `ias`: Aircraft Indicated Airspeed (knots)
4. `agl_ft`: Altitude Above Ground Level (feet)
5. `vs_fpm`: Vertical sink/climb rate (feet per minute)
6. `delta_ias`: 1-second dynamic rate delta for Airspeed (\(\Delta \text{IAS}\))
7. `delta_vs_fpm`: 1-second dynamic rate delta for Vertical Speed (\(\Delta \text{VS}\))
8. `delta_alt_ft`: 1-second dynamic rate delta for Altitude (\(\Delta \text{ALT}\))

### 4.3 Holdout Test Set Performance Matrix

| Target Scenario Class | Precision | Recall | F1-Score | Support (Samples) |
| :--- | :---: | :---: | :---: | :---: |
| **NORMAL (0)** | 1.0000 | 1.0000 | 1.0000 | 565 |
| **PRE-DISTURBANCE (1)** | 1.0000 | 1.0000 | 1.0000 | 36 |
| **RECOVERY (2)** | 1.0000 | 1.0000 | 1.0000 | 60 |
| **MICROBURST (3)** | 1.0000 | 1.0000 | 1.0000 | 60 |
| **Overall Model Accuracy** | **1.0000** | **1.0000** | **1.0000** | **721** |

### 4.4 Holdout Confusion Matrix
```text
                  PREDICTED CLASS
             NORM    PRE     REC     MB
ACTUAL NORM  [565      0       0      0]
ACTUAL PRE   [  0     36       0      0]
ACTUAL REC   [  0      0      60      0]
ACTUAL MB    [  0      0       0     60]
```

---

## 5. UI/UX Dashboard Features (Person 6)
- **360° Tactical Radar**: HTML5 Canvas renderer with range rings (5, 10, 15 km), sweep line, hazard zone overlay, and trail interpolation.
- **Cockpit Audio Alerts**: Offline Web Audio API synthesizing dual-tone Caution chimes and rapid-pulsing Master Warning alarms.
- **Dynamic 1 Hz Metrics**: Displaying real-time changes (\(\Delta\text{IAS}\), \(\Delta\text{VS}\), \(\Delta\text{Wind}\)).
- **Person 5 Live FastAPI Bridge**: Direct polling connection to `http://localhost:8000/alert`.
- **4-Phase Flight Scenario Replay**: 78-step synchronized playback scrubber with speed control ($0.5\times$ to $5.0\times$).

---

## 6. Safety & Operational Disclaimer
*AeroShield is an engineering prototype developed for demonstration and hackathon evaluation using simulated flight dynamics (JSBSim) and experimental sensor streams. It has not been flight-certified or validated by civil aviation authorities (FAA/ICAO/EASA) for operational instrument flight rules (IFR).*
