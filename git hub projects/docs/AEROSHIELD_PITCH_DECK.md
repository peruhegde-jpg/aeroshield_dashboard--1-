# AEROSHIELD - HACKATHON PITCH DECK & PRESENTATION SCRIPT
### Affordable Early Warning System for Atmospheric Microburst Risk to Aircraft
**Team Role: Person 6 (UI, Alerts & Documentation)**  
**Deadline: 29 August 2026**

---

## SLIDE 1: Title Slide (Hook & Brand)

### Visual Content:
- **Title**: **AERO<span style="color:#00f0ff">SHIELD</span>**
- **Subtitle**: *Affordable Early Warning System for Atmospheric Microburst Risk to Aircraft*
- **Tagline**: "Proactive Convective Hazard Detection for General & Commercial Aviation"
- **Team**: 6-Member Multidisciplinary Engineering Team (Hardware, Simulation, Data Engineering, ML, Integration, UI/UX)
- **Visuals**: Dark aerospace cockpit mockup with cyan tactical radar range rings and glowing alarm status.

### Speaker Notes (Person 6):
> "Good morning judges. Every year, low-altitude convective wind shear and microbursts pose a deadly threat to aircraft during critical takeoff and landing phases. Today, we are proud to introduce **AeroShield**—a complete, end-to-end, affordable early warning system that bridges low-cost IoT weather stations, real-time aircraft telemetry, and machine learning to give pilots and air traffic controllers actionable warnings before disaster strikes."

---

## SLIDE 2: The Critical Aviation Problem

### Visual Content:
- **The Threat**: Microbursts — intense localized columns of sinking air (downdrafts) that produce violent divergent outflows of up to 50+ knots at ground level.
- **Why It Is Deadly**:
  - Aircraft flying into a microburst encounters a sudden headwind (increasing lift), followed immediately by a severe downdraft and a catastrophic tailwind (loss of lift and airspeed at low altitude).
  - Infamous crashes: Delta Flight 191, Pan Am Flight 759.
- **The Gap**:
  - High-end Terminal Doppler Weather Radar (TDWR) and Airborne Windshear Systems cost **millions of dollars**, leaving general aviation airports, regional airfields, and smaller aircraft unprotected.

### Speaker Notes:
> "When an aircraft encounters a microburst on final approach, it first experiences increased headwind. If the pilot reduces power, the aircraft immediately enters the downburst core and severe tailwind, leading to stall and crash within seconds. While major international hubs have multi-million dollar TDWR radar, thousands of regional and general aviation airports worldwide have zero dedicated microburst detection. AeroShield democratizes microburst protection using low-cost edge sensing and intelligent predictive models."

---

## SLIDE 3: The AeroShield Solution & Core Innovation

### Visual Content:
- **4-Pillar Integrated Architecture**:
  1. **ESP32 Micro-Meteorological Sensor Nodes** (Surface In-situ Detection)
  2. **JSBSim High-Fidelity Flight Dynamics Simulation** (Real-Time Aircraft Telemetry)
  3. **Random Forest Predictive Classifier** (Instantaneous Downdraft & Microburst Probability)
  4. **Geodesic Risk Engine & Cockpit HUD** (Haversine Proximity, Trajectory Vector Alignment, Time-to-Encounter, Visual & Audio Alerts)
- **Key Advantage**: 100% Offline, edge-compatible, non-proprietary, low latency (<1ms risk evaluation).

### Speaker Notes:
> "AeroShield is not a static visualization—it is an end-to-end operational pipeline. We fuse physical sensor hardware with physics-based flight telemetry and machine learning. Our risk engine calculates exact geodesic distance, forward bearing, trajectory alignment, and estimated time-to-encounter to classify risk into Low, Caution, and High states."

---

## SLIDE 4: End-to-End System Architecture

### Visual Content:
```
[ESP32 Weather Node] ──┐
 (Temp, RH, Press, Wind) │
                        ├──> [Person 3 Data Pipeline] ──> [Person 4 Random Forest]
[JSBSim Flight Telemetry]│      (Merge & Clean)                 (ML Prob %)
 (Lat, Lon, Alt, Spd, Hdg)│                                            │
                        └───────────────────────┬──────────────────────┘
                                                │
                                                ▼
                                    [AeroShield Risk Engine]
                                    - Haversine Distance (d)
                                    - Forward Bearing (θ)
                                    - Vector Alignment (Δheading)
                                    - Time-to-Encounter (TTE)
                                                │
                                                ▼
                                    [AeroShield UI & Cockpit HUD]
                                    - 360° Tactical Radar
                                    - Visual Warning Banners
                                    - Web Audio Alarm Synthesizer
```

### Speaker Notes:
> "Here is our 6-member parallel architecture. Person 1’s ESP32 collects meteorological boundary indicators. Person 2 simulates aircraft physics in JSBSim. Person 3 aligns these multi-rate streams. Person 4 trains our Random Forest classifier. Person 5 bridges the live pipeline, and Person 6—our cockpit dashboard—renders tactical radar, telemetry instruments, and synthesized audio alarms."

---

## SLIDE 5: Machine Learning Model & Validation Results

### Visual Content:
- **Model**: Random Forest Classifier (100 Decision Trees, Gini Impurity)
- **Held-Out Test Set Accuracy**: **89.8%** (167 / 186 samples correct)
- **Classes**: `NORM` (Nominal), `WET` (Precipitating Microburst), `DRY` (Virga / Dry Downdraft)
- **Confusion Matrix Breakdown**:
  - `NORM`: 94.6% Recall
  - `WET`: 92.2% Recall
  - `DRY`: 70.0% Recall
- **Top Feature Importances**:
  - `humidity_change` (28% Gini weight)
  - `precipitation` (22%)
  - `humidity` (18%)
  - `wind_speed_roll_std` (14%)
  - `wind_speed` (11%)
  - `wind_speed_rate` (7%)

### Speaker Notes:
> "Our model was benchmarked on a held-out test dataset, achieving 89.8% classification accuracy. Feature importance analysis confirms meteorological domain physics: the rate of change of relative humidity and instantaneous precipitation intensity are the strongest leading indicators of an imminent downburst."

---

## SLIDE 6: Transparent Geodesic Risk Engine

### Visual Content:
- **Spherical Geometry & Formulas**:
  - **Distance**: Haversine formula $d = 2 R \arcsin(\sqrt{a})$
  - **Bearing**: $\theta = \text{atan2}(\sin\Delta\lambda\cos\phi_2, \cos\phi_1\sin\phi_2 - \sin\phi_1\cos\phi_2\cos\Delta\lambda)$
  - **Approach Alignment**: $\Delta\text{heading} = \min(|\psi - \theta|, 360^\circ - |\psi - \theta|) \le 55^\circ$
  - **Time-to-Encounter (TTE)**: $\text{TTE} = d / (V_{\text{airspeed}} \cdot \cos(\Delta\text{heading}))$
- **Explainable Decision Rules**:
  - **LOW**: Nominal separation ($>15\text{ km}$), diverging vector, or ML probability $<45\%$.
  - **CAUTION**: ML Prob $\ge 45\%$, heading toward hazard, and $d \le 15\text{ km}$.
  - **HIGH**: ML Prob $\ge 75\%$, heading toward hazard, and $d \le 5\text{ km}$ (or $\text{TTE} \le 45\text{s}$).

### Speaker Notes:
> "In safety-critical aviation, black-box decisions are unacceptable. AeroShield features a completely transparent risk engine. It evaluates not just proximity, but whether the aircraft's heading vector converges on the hazard, calculating closing speed and exact seconds to encounter."

---

## SLIDE 7: Live Demonstration (The 4 Flight Phases)

### Visual Content:
- **Phase 1 (Steps 1–22)**: Nominal Entry — Distance 38 km $\to$ 22 km, ML Prob 4.5%, Risk **LOW** (Green status).
- **Phase 2 (Steps 23–44)**: Weather Deterioration — Humidity jumps 54% $\to$ 81%, wind gust 17 m/s, Distance 7 km, ML Prob 68%, Risk **CAUTION** (Amber advisory + chime).
- **Phase 3 (Steps 45–62)**: Hazard Encounter & Breakout — Distance 1.8 km, Wind 28.7 m/s (56 kt), ML Prob 96.8%, Risk **HIGH** (Flashing Master Warning banner + rapid alarm siren). Pilot executes evasive right turn!
- **Phase 4 (Steps 63–78)**: Recovery — Climb to 1660 m, separation expands to 24 km, Risk returns to **LOW**.

### Speaker Notes:
> "Let’s look at the live dashboard in action. [Person 6 clicks Play]. In Phase 1, the aircraft is 35 km away in clear skies. As we enter Phase 2, sensor humidity surges, wind speeds accelerate, and our Recharts probability graph climbs into Caution. By Step 45, the aircraft reaches the hazard perimeter—our Master Warning Banner flashes in red, and the Web Audio engine triggers an urgent cockpit alert. The pilot initiates an evasive turn, passes clear of the cell, and climbs to safety in Phase 4."

---

## SLIDE 8: Team Work Division & Execution Timeline

### Visual Content:
| Member | Role | Deliverable | Status |
| :--- | :--- | :--- | :--- |
| **Person 1** | Hardware & Sensors | ESP32 Node & Sensor Stream | Completed / In-Test |
| **Person 2** | Aircraft Simulation | JSBSim Flight Telemetry | Completed / In-Test |
| **Person 3** | Data Engineering | Synchronized Unified Dataset | Completed / In-Test |
| **Person 4** | ML / Data Science | Random Forest Model (89.8% Acc) | Completed / In-Test |
| **Person 5** | System Integration | Real-time Bridge Pipeline | In-Progress |
| **Person 6 (You)** | UI, Alerts & Docs | Live Dashboard, PPT, Report, Video | **DELIVERED & VERIFIED** |

**Final Milestone: 29 August 2026 — Full Prototype Integration & Submission**

---

## SLIDE 9: Key Technical Highlights & Hackathon Innovation

### Visual Content:
- **100% Offline Capability**: Runs entirely locally via Vite, React, Tailwind, and Web Audio API without paid cloud APIs.
- **Dual Visualizer**: Seamless switching between Tactical HUD Canvas Radar and Leaflet OpenStreetMap.
- **Flexible Data Ingestion**: Supports drag-and-drop CSV uploads for unified datasets or 3 separate streams.
- **Fully Configurable**: Live settings drawer to adjust hazard coordinates and risk thresholds without rebuilding.

---

## SLIDE 10: Conclusion & Impact

### Visual Content:
- **Summary**: AeroShield provides an affordable, explainable, and multi-sensor early warning system for atmospheric microburst hazards.
- **Future Vision**: Edge-computing drone deployments, ADS-B Out ground station integration, and multi-aircraft fleet situational awareness.
- **Call to Action**: "Questions & Live Demonstration"

### Speaker Notes:
> "AeroShield proves that cutting-edge aviation safety does not have to cost millions of dollars. By fusing IoT edge sensing, physics-based telemetry, and explainable machine learning, we can protect lives in general aviation, regional airfields, and commercial corridors. Thank you, and we are ready for your questions!"
