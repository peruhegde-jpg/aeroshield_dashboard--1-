/**
 * CSV Ingestion & Synchronization Engine
 * 
 * Enhanced for Person 4's 4-Class ML Model & Person 2's JSBSim Telemetry:
 * - 4 Classes: NORMAL (0), PRE-DISTURBANCE (1), RECOVERY (2), MICROBURST (3)
 * - 8 Features: wind_speed_kt, wind_direction_deg, ias, agl_ft, vs_fpm, delta_ias, delta_vs_fpm, delta_alt_ft
 */

import Papa from 'papaparse';

function cleanNumber(val, fallback = 0) {
  if (val === undefined || val === null || val === '') return fallback;
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

/**
 * Parse raw CSV text string using PapaParse
 */
export function parseCSVString(csvText) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/[\s\-_]+/g, '_'),
      complete: (results) => resolve(results.data),
      error: (err) => reject(err)
    });
  });
}

/**
 * Convert dataset rows into AeroShield standard format with Person 4 4-class ML mapping
 */
export function processUnifiedDataset(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Dataset is empty or invalid format.");
  }

  const totalSteps = rows.length;

  return rows.map((row, idx) => {
    const stepNum = idx + 1;
    const rawTs = row.timestamp || (row.sim_t !== undefined ? `T+${String(row.sim_t).padStart(3, '0')}s` : `T+${String(stepNum).padStart(3, '0')}`);
    const timestampStr = typeof rawTs === 'string' ? (rawTs.includes('T') ? rawTs.split('T')[1]?.replace('Z','') || rawTs : rawTs) : String(rawTs);

    // Coordinates
    const lat = cleanNumber(row.lat ?? row.latitude, 28.7218);
    const lon = cleanNumber(row.lon ?? row.longitude ?? row.lng, 77.1000);
    
    // Altitude: AGL in feet or meters
    const altFt = cleanNumber(row.agl_ft ?? row.alt_ft ?? row.altitude ?? row.alt, 3000);
    const altM = Math.round(altFt * 0.3048); // ft to meters
    
    // Speeds & Heading
    const spd = cleanNumber(row.ias ?? row.airspeed ?? row.gs ?? row.speed, 80);
    const hdg = cleanNumber(row.hdg ?? row.heading ?? row.track_deg, 90);
    const vsFpm = cleanNumber(row.vs_fpm ?? row.vertical_speed ?? row.delta_vs_fpm, 0);

    // Weather
    const wspdKt = cleanNumber(row.wind_speed_kt ?? (row.wind_speed ? row.wind_speed * 1.94384 : 5.0), 5.0);
    const wspdMs = Number((wspdKt * 0.514444).toFixed(1));
    const wdir = cleanNumber(row.wind_direction_deg ?? row.wind_direction ?? row.winddir, 63);
    const temp = cleanNumber(row.temperature ?? row.temp, 27.0);
    const hum = cleanNumber(row.humidity ?? row.hum, 65.0);
    const pres = cleanNumber(row.pressure ?? row.pres, 1008.0);
    const rain = row.rain !== undefined ? String(row.rain) : (wspdMs > 15 ? "Heavy Downpour" : wspdMs > 8 ? "Moderate Rain" : "No");

    // Dynamic deltas (Person 4 8-features)
    const deltaIas = cleanNumber(row.delta_ias, 0);
    const deltaVs = cleanNumber(row.delta_vs_fpm, 0);
    const deltaAlt = cleanNumber(row.delta_alt_ft, 0);
    const deltaWind = cleanNumber(row.delta_wind_speed, 0);

    // Person 4 4-Class Mapping: NORMAL, PRE-DISTURBANCE, RECOVERY, MICROBURST
    const rawScenario = String(row.predicted_scenario ?? row.scenario ?? '').toUpperCase();
    let predClass = "NORMAL";
    let prob = cleanNumber(row.microburst_probability ?? row.probability, 0);

    if (rawScenario.includes('MICROBURST') || rawScenario === '3' || prob >= 75) {
      predClass = "MICROBURST";
      if (prob === 0) prob = 96.5;
    } else if (rawScenario.includes('PRE') || rawScenario === '1' || (prob >= 30 && prob < 75)) {
      predClass = "PRE-DISTURBANCE";
      if (prob === 0) prob = 58.0;
    } else if (rawScenario.includes('RECOVERY') || rawScenario === '2') {
      predClass = "RECOVERY";
      if (prob === 0) prob = 35.0;
    } else {
      predClass = "NORMAL";
      if (prob === 0) prob = 6.2;
    }

    return {
      step: stepNum,
      stepFormatted: `Step ${String(stepNum).padStart(3, '0')} / ${totalSteps}`,
      timestamp: timestampStr,
      isoTimestamp: row.timestamp || new Date().toISOString(),
      phase: predClass === "MICROBURST" ? 3 : predClass === "PRE-DISTURBANCE" ? 2 : predClass === "RECOVERY" ? 4 : 1,
      phaseName: predClass === "MICROBURST" ? "CRITICAL: Severe Microburst" : predClass === "PRE-DISTURBANCE" ? "CAUTION: Pre-Disturbance Shear" : predClass === "RECOVERY" ? "RECOVERY: Climb & Stabilize" : "NORMAL: Approach Flight",
      aircraft: {
        timestamp: timestampStr,
        latitude: Number(lat.toFixed(5)),
        longitude: Number(lon.toFixed(5)),
        altitude: altM,
        altitudeFt: Math.round(altFt),
        heading: Math.round((hdg % 360 + 360) % 360),
        airspeed: Math.round(spd),
        vertical_speed: Math.round(vsFpm),
        pitch: cleanNumber(row.pitch, 0),
        roll: cleanNumber(row.roll, 0),
        aoa: cleanNumber(row.aoa, 0),
        load_factor_g: cleanNumber(row.load_factor_g, 1.0)
      },
      weather: {
        timestamp: timestampStr,
        temperature: Number(temp.toFixed(1)),
        humidity: Number(hum.toFixed(1)),
        pressure: Number(pres.toFixed(1)),
        wind_speed: wspdMs,
        wind_direction: Math.round((wdir % 360 + 360) % 360),
        rain: rain
      },
      dynamicFeatures: {
        delta_ias: deltaIas,
        delta_vs: deltaVs,
        delta_alt: deltaAlt,
        delta_wind_speed: deltaWind
      },
      ml: {
        timestamp: timestampStr,
        microburst_probability: Number(prob.toFixed(1)),
        predicted_class: predClass,
        predicted_scenario: predClass
      }
    };
  });
}

/**
 * Merge separate datasets
 */
export function mergeSeparateDatasets(aircraftRows, weatherRows, mlRows) {
  const maxLen = Math.max(
    aircraftRows?.length || 0,
    weatherRows?.length || 0,
    mlRows?.length || 0
  );

  if (maxLen === 0) {
    throw new Error("No data rows found in provided CSV files.");
  }

  const merged = [];

  for (let i = 0; i < maxLen; i++) {
    const ac = aircraftRows?.[i] || (aircraftRows?.length ? aircraftRows[aircraftRows.length - 1] : {});
    const wx = weatherRows?.[i] || (weatherRows?.length ? weatherRows[weatherRows.length - 1] : {});
    const ml = mlRows?.[i] || (mlRows?.length ? mlRows[mlRows.length - 1] : {});

    const ts = ac.timestamp || wx.timestamp || ml.timestamp || `T+${i}s`;

    merged.push({
      timestamp: ts,
      lat: ac.lat ?? ac.latitude ?? 28.7218,
      lon: ac.lon ?? ac.longitude ?? 77.1000,
      alt_ft: ac.agl_ft ?? ac.alt_ft ?? ac.altitude ?? 3000,
      hdg: ac.hdg ?? ac.heading ?? 90,
      ias: ac.ias ?? ac.airspeed ?? 80,
      vs_fpm: ac.vs_fpm ?? ac.vertical_speed ?? 0,

      temperature: wx.temperature ?? wx.temp ?? 27.0,
      humidity: wx.humidity ?? wx.hum ?? 65.0,
      pressure: wx.pressure ?? wx.pres ?? 1008.0,
      wind_speed_kt: wx.wind_speed_kt ?? (wx.wind_speed ? wx.wind_speed * 1.94384 : 5.0),
      wind_direction_deg: wx.wind_direction_deg ?? wx.wind_direction ?? 63,
      rain: wx.rain ?? "No",

      microburst_probability: ml.microburst_probability ?? ml.probability ?? 10.0,
      predicted_scenario: ml.predicted_scenario ?? ml.predicted_class ?? "NORMAL"
    });
  }

  return processUnifiedDataset(merged);
}

/**
 * Generate sample CSV strings
 */
export function generateSampleCSVs(demoSteps) {
  const unifiedHeaders = "timestamp,lat,lon,alt_ft,agl_ft,ias,tas,gs,hdg,vs_fpm,pitch,roll,aoa,wind_speed_kt,wind_direction_deg,scenario,microburst_probability,predicted_class\n";
  let unifiedBody = "";

  demoSteps.forEach(s => {
    const altFt = Math.round(s.aircraft.altitude * 3.28084);
    unifiedBody += `${s.timestamp},${s.aircraft.latitude},${s.aircraft.longitude},${altFt},${altFt},${s.aircraft.airspeed},${s.aircraft.airspeed},${s.aircraft.airspeed},${s.aircraft.heading},0,0,0,0,${(s.weather.wind_speed * 1.94384).toFixed(1)},${s.weather.wind_direction},"${s.phaseName}",${s.ml.microburst_probability},${s.ml.predicted_class}\n`;
  });

  return {
    unified: unifiedHeaders + unifiedBody,
    aircraft: unifiedHeaders + unifiedBody
  };
}
