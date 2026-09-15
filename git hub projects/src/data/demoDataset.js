/**
 * AeroShield 78-Step Coherent Demonstration Scenario
 * 
 * Synchronized across 4 distinct phases:
 * Phase 1 (Steps 1-22): Nominal Cruising / Approach, Low Risk
 * Phase 2 (Steps 23-44): Weather Deterioration, Caution Risk
 * Phase 3 (Steps 45-62): Downburst Core Penetration & Evasive Turn, High Risk Alert
 * Phase 4 (Steps 63-78): Breakout Climb & Recovery, Risk Relieved
 */

import { DEFAULT_CONFIG } from '../config/riskConfig';

function generateDemoScenario() {
  const steps = [];
  const totalSteps = 78;
  const hazardLat = DEFAULT_CONFIG.hazard.latitude; // 28.7041
  const hazardLon = DEFAULT_CONFIG.hazard.longitude; // 77.1025
  const baseTime = 1724475000000; // Reference timestamp

  for (let i = 1; i <= totalSteps; i++) {
    const timeOffsetSec = (i - 1) * 5; // 5-second interval per time step
    const dateObj = new Date(baseTime + timeOffsetSec * 1000);
    const timestampStr = dateObj.toISOString().substr(11, 8); // "HH:MM:SS"

    let phase = 1;
    let phaseName = "Phase 1: Nominal Flight";
    let lat, lon, alt, spd, hdg;
    let temp, hum, pres, wspd, wdir, rain;
    let prob, predClass;

    if (i <= 22) {
      // PHASE 1: Normal Approach (Steps 1-22)
      phase = 1;
      phaseName = "Phase 1: Nominal Sector Entry";
      const progress = (i - 1) / 21; // 0 to 1
      
      lat = 28.4200 + (28.5600 - 28.4200) * progress;
      lon = 76.8800 + (76.9750 - 76.8800) * progress;
      alt = Math.round(1550 + progress * 40 + Math.sin(i) * 5);
      spd = Math.round(124 - progress * 4 + Math.cos(i) * 1.5);
      hdg = Math.round(38 + progress * 4);

      temp = Number((32.5 - progress * 1.8 + Math.sin(i * 0.5) * 0.2).toFixed(1));
      hum = Number((42.0 + progress * 12.0 + Math.cos(i * 0.4) * 0.8).toFixed(1));
      pres = Number((1012.4 - progress * 2.8).toFixed(1));
      wspd = Number((4.5 + progress * 2.8 + Math.sin(i) * 0.4).toFixed(1));
      wdir = Math.round(180 + progress * 18);
      rain = "No";

      prob = Number((4.5 + progress * 14.5 + Math.sin(i * 0.8) * 1.2).toFixed(1));
      predClass = "NORM";
    } else if (i <= 44) {
      // PHASE 2: Atmospheric Deterioration (Steps 23-44)
      phase = 2;
      phaseName = "Phase 2: Convective Front Convergence";
      const progress = (i - 23) / 21; // 0 to 1

      lat = 28.5650 + (28.6650 - 28.5650) * progress;
      lon = 76.9800 + (77.0650 - 76.9800) * progress;
      alt = Math.round(1580 - progress * 420 + Math.sin(i * 1.2) * 12);
      spd = Math.round(120 - progress * 6 + Math.sin(i) * 2);
      hdg = Math.round(44 + progress * 2);

      temp = Number((30.7 - progress * 4.9).toFixed(1));
      hum = Number((54.5 + progress * 26.5).toFixed(1));
      pres = Number((1009.6 - progress * 6.2).toFixed(1));
      wspd = Number((7.3 + progress * 9.8 + Math.sin(i * 1.5) * 1.2).toFixed(1));
      wdir = Math.round(198 + progress * 58);
      rain = progress < 0.4 ? "Light Rain" : "Moderate Rain";

      prob = Number((21.0 + progress * 49.5 + Math.sin(i) * 1.8).toFixed(1));
      predClass = progress < 0.6 ? "WET" : "WET";
    } else if (i <= 62) {
      // PHASE 3: Microburst Penetration & Evasive Turn (Steps 45-62)
      phase = 3;
      phaseName = "Phase 3: Microburst Encounter & Evasion";
      const progress = (i - 45) / 17; // 0 to 1

      // Curves close to hazard center (28.7041, 77.1025) then executes right turn
      if (progress < 0.5) {
        const subP = progress / 0.5;
        lat = 28.6700 + (28.7020 - 28.6700) * subP;
        lon = 77.0700 + (77.1010 - 77.0700) * subP;
        hdg = Math.round(46 + subP * 25); // Heading begins breaking right 46 -> 71
      } else {
        const subP = (progress - 0.5) / 0.5;
        lat = 28.7020 + (28.7180 - 28.7020) * subP;
        lon = 77.1010 + (77.1350 - 77.1010) * subP;
        hdg = Math.round(71 + subP * 44); // Hard right evasive heading 71 -> 115
      }

      alt = Math.round(1160 - Math.sin(progress * Math.PI) * 450 + Math.sin(i * 2.5) * 20);
      spd = Math.round(114 - Math.sin(progress * Math.PI) * 14 + Math.cos(i * 2) * 3);

      temp = Number((25.5 - Math.sin(progress * Math.PI) * 4.6).toFixed(1)); // Drops to ~20.9°C cold pool
      hum = Number((81.0 + Math.sin(progress * Math.PI) * 15.5).toFixed(1)); // Peaks ~96.5%
      pres = Number((1003.4 - Math.sin(progress * Math.PI) * 6.5).toFixed(1)); // Plunges to ~996.9 hPa
      wspd = Number((17.5 + Math.sin(progress * Math.PI) * 11.2 + Math.sin(i * 3) * 2.1).toFixed(1)); // Peaks ~28.7 m/s (56 kt)
      wdir = Math.round((256 + progress * 95) % 360);
      rain = "Heavy Downpour";

      prob = Number((72.5 + Math.sin(progress * Math.PI) * 24.8 + Math.cos(i) * 1.5).toFixed(1));
      prob = Math.min(98.8, Math.max(72.0, prob));
      predClass = "WET";
    } else {
      // PHASE 4: Breakout & Stabilization (Steps 63-78)
      phase = 4;
      phaseName = "Phase 4: Breakout Climb & Recovery";
      const progress = (i - 63) / 15; // 0 to 1

      lat = 28.7180 + (28.6120 - 28.7180) * progress;
      lon = 77.1380 + (77.2650 - 77.1380) * progress;
      alt = Math.round(740 + progress * 920 + Math.sin(i) * 8); // Climb to 1660 m
      spd = Math.round(108 + progress * 32); // Acceleration to 140 kt
      hdg = Math.round(115 + progress * 30); // Stabilizes on SE breakout heading ~145

      temp = Number((22.5 + progress * 7.2).toFixed(1));
      hum = Number((86.0 - progress * 34.0).toFixed(1));
      pres = Number((999.5 + progress * 11.8).toFixed(1));
      wspd = Number((21.0 - progress * 16.5).toFixed(1));
      wdir = Math.round(330 - progress * 120);
      rain = progress < 0.3 ? "Moderate Rain" : progress < 0.7 ? "Light Rain" : "No";

      prob = Number((68.0 - progress * 58.5 + Math.sin(i) * 1.2).toFixed(1));
      prob = Math.max(4.2, prob);
      predClass = progress < 0.4 ? "WET" : "NORM";
    }

    steps.push({
      step: i,
      stepFormatted: `Step ${String(i).padStart(2, '0')} / ${totalSteps}`,
      timestamp: timestampStr,
      isoTimestamp: dateObj.toISOString(),
      phase,
      phaseName,
      aircraft: {
        timestamp: timestampStr,
        latitude: Number(lat.toFixed(5)),
        longitude: Number(lon.toFixed(5)),
        altitude: alt,
        heading: (hdg + 360) % 360,
        airspeed: spd
      },
      weather: {
        timestamp: timestampStr,
        temperature: temp,
        humidity: hum,
        pressure: pres,
        wind_speed: wspd,
        wind_direction: wdir,
        rain: rain
      },
      ml: {
        timestamp: timestampStr,
        microburst_probability: prob,
        predicted_class: predClass
      }
    });
  }

  return steps;
}

export const DEMO_DATASET = generateDemoScenario();
