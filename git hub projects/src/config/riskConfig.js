/**
 * AeroShield Risk Configuration
 * 
 * Centralized, configurable risk thresholds and hazard parameters.
 * Note: These values are experimental prototype parameters for demonstration.
 */

export const DEFAULT_CONFIG = {
  // Hazard Center Location (Simulated microburst centroid near Delhi NCR region for demo)
  hazard: {
    name: "SIM-MB-01 (Sector North)",
    latitude: 28.7041,
    longitude: 77.1025,
    radiusKm: 3.5,            // Outer microburst outflow boundary
    coreRadiusKm: 1.2,        // Severe downburst core
  },

  // Risk Classification Thresholds
  thresholds: {
    // Microburst ML Probability (%)
    probCaution: 45,          // >= 45% triggers caution consideration
    probHigh: 75,             // >= 75% triggers high risk consideration

    // Proximity / Distance (km)
    distanceCautionKm: 15.0,  // Proximity caution buffer
    distanceHighKm: 5.0,      // Critical proximity buffer

    // Estimated Time to Encounter (seconds)
    tteCautionSec: 150,       // <= 150s encounter window
    tteHighSec: 45,           // <= 45s critical encounter window

    // Trajectory alignment tolerance (degrees)
    // If angular difference between aircraft heading and bearing to hazard <= approachAngleThresholdDeg,
    // the aircraft is considered "HEADING TOWARD HAZARD".
    approachAngleThresholdDeg: 55,
  },

  // Replay System Defaults
  replay: {
    defaultStepMs: 1000,      // Normal 1x playback delay per step (ms)
    speeds: [0.5, 1, 2, 5],
  }
};
