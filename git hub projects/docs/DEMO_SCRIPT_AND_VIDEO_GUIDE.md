# AEROSHIELD - LIVE DEMONSTRATION & VIDEO RECORDING SCRIPT
### 3-Minute Hackathon Demo Walkthrough for Person 6 (UI, Alerts & Documentation)

Use this step-by-step guide when presenting to hackathon judges or recording your final project video demonstration.

---

## Pre-Demo Checklist
1. Open terminal and run `start_dashboard.bat` or `npm run dev`.
2. Open Chrome/Edge at `http://localhost:5173`.
3. Press `F11` for full-screen presentation mode.
4. Set playback speed to **`1x`** or **`2x`**.
5. Click **"ENABLE SOUND"** in the top navigation bar so judges can hear the synthesized audio alerts.

---

## Timed Video Script (0:00 to 3:00)

---

### [0:00 - 0:30] Introduction & Problem Hook
- **Action**: Show main dashboard at Step 1 (Nominal Entry).
- **Speech**:
  > *"Hello judges, I am representing Team AeroShield. Low-altitude atmospheric microbursts and wind shear remain one of the most fatal weather hazards in aviation history. While major hub airports use multi-million dollar Doppler radar, general aviation and regional airfields lack affordable early warning solutions. AeroShield solves this problem by combining IoT weather sensors, aircraft telemetry, and machine learning into an explainable, real-time cockpit early warning system."*

---

### [0:30 - 1:00] Dashboard Tour & Phase 1 (Nominal Flight)
- **Action**: Highlight the 360° Tactical Radar, Telemetry panel, and Weather panel.
- **Speech**:
  > *"Here on our dashboard, we have our Tactical Situation Radar on the left, live aircraft telemetry in the center, and in-situ weather data on the right. At Step 1, our aircraft is 35 kilometers out on approach in clear skies. The ML microburst probability is only 4.5%, the distance is safe, and our risk engine confirms a LOW RISK nominal state."*

---

### [1:00 - 1:40] Phase 2 (Deterioration & Caution Advisory)
- **Action**: Click **PLAY REPLAY** (or drag timeline scrubber to Step 28–35).
- **Speech**:
  > *"Now we start the flight replay. As the aircraft approaches the storm sector in Phase 2, watch our weather panel: relative humidity surges to over 75%, barometric pressure drops, and wind shear increases. The Random Forest model immediately catches these precursor indicators—microburst probability climbs above 50%, triggering an AMBER CAUTION ADVISORY on the alert banner and an audible cockpit chime."*

---

### [1:40 - 2:20] Phase 3 (Hazard Penetration & Master Warning Alert)
- **Action**: Let replay progress into Steps 45–54 (or scrub to Step 50).
- **Speech**:
  > *"As we reach Step 48, the aircraft enters the critical hazard perimeter. Distance drops below 2 kilometers and the ML probability spikes to 96.8%. The system instantly escalates to a RED MASTER WARNING: 'MICROBURST HAZARD AHEAD'. Notice our transparent decision panel explaining exactly why this was triggered: critical proximity, converging heading vector, and an encounter time of under 20 seconds. The urgent audio alarm pulses, prompting the pilot to execute an immediate evasive right turn."*

---

### [2:20 - 2:45] Phase 4 (Breakout Recovery & ML Validation)
- **Action**: Let replay advance to Steps 65–78, then scroll down to the ML Validation Panel.
- **Speech**:
  > *"In Phase 4, the aircraft breaks clear of the downdraft core and climbs out safely to 1,600 meters—risk transitions back to LOW. Below our HUD, our ML Validation Panel shows our Random Forest benchmark on a held-out test set: 89.8% classification accuracy across 186 samples, with humidity rate-of-change and precipitation intensity confirmed as the top predictive features."*

---

### [2:45 - 3:00] Data Upload, Customization & Conclusion
- **Action**: Click **LOAD CSV** to show the custom ingestion modal, then conclude.
- **Speech**:
  > *"AeroShield is fully functional with live CSV ingestion, offline Web Audio, and configurable risk thresholds. We have delivered a complete prototype for under a fraction of traditional radar costs. Thank you!"*
