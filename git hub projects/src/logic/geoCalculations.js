/**
 * Aviation & Geodesic Calculation Utilities
 * 
 * Implements standard spherical trigonometry models for distance, bearing,
 * trajectory vectors, and time-to-encounter.
 * 
 * DISCLAIMER: These calculations are for prototype demonstration and simulation.
 * Not certified for operational flight planning.
 */

const EARTH_RADIUS_KM = 6371.0;
const KNOTS_TO_KMH = 1.852;
const KNOTS_TO_MPS = 0.514444;

/**
 * Convert degrees to radians
 */
export function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

/**
 * Calculate Great Circle distance between two points using the Haversine formula
 * @param {number} lat1 Latitude of point 1 (degrees)
 * @param {number} lon1 Longitude of point 1 (degrees)
 * @param {number} lat2 Latitude of point 2 (degrees)
 * @param {number} lon2 Longitude of point 2 (degrees)
 * @returns {number} Distance in kilometers
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 0;
  }

  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Calculate initial Great Circle bearing from point 1 to point 2
 * @param {number} lat1 Latitude of origin (degrees)
 * @param {number} lon1 Longitude of origin (degrees)
 * @param {number} lat2 Latitude of target (degrees)
 * @param {number} lon2 Longitude of target (degrees)
 * @returns {number} Initial bearing in degrees [0, 360)
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 0;
  }

  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaLambda = toRadians(lon2 - lon1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  const bearing = (toDegrees(theta) + 360) % 360;

  return bearing;
}

/**
 * Calculate minimum angular difference between aircraft heading and bearing to hazard
 * @param {number} heading Aircraft heading (degrees [0, 360))
 * @param {number} bearing Bearing toward hazard (degrees [0, 360))
 * @returns {number} Angular difference in degrees [0, 180]
 */
export function calculateHeadingDelta(heading, bearing) {
  const diff = Math.abs(heading - bearing) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Determine if aircraft is heading toward hazard within an angular threshold
 * @param {number} heading Aircraft heading in degrees
 * @param {number} bearing Bearing to hazard in degrees
 * @param {number} thresholdDeg Angular threshold in degrees
 * @returns {boolean}
 */
export function isHeadingTowardHazard(heading, bearing, thresholdDeg = 55) {
  const delta = calculateHeadingDelta(heading, bearing);
  return delta <= thresholdDeg;
}

/**
 * Calculate Estimated Time-to-Encounter (TTE) in seconds
 * @param {number} distanceKm Distance to hazard in kilometers
 * @param {number} airspeedKnots Airspeed in knots
 * @param {number} headingDeltaDeg Angular difference between heading and bearing
 * @returns {number|null} TTE in seconds, or null if stationary / diverging
 */
export function calculateTimeToEncounter(distanceKm, airspeedKnots, headingDeltaDeg = 0) {
  if (!airspeedKnots || airspeedKnots <= 5) {
    return null;
  }

  // If aircraft is moving away (heading delta > 90 deg), direct encounter is not imminent along current vector
  if (headingDeltaDeg > 90) {
    return null;
  }

  // Speed in km/second
  const speedKmPerSec = (airspeedKnots * KNOTS_TO_KMH) / 3600;

  // Effective radial closing velocity: V_r = V * cos(delta)
  const cosDelta = Math.cos(toRadians(headingDeltaDeg));
  const effectiveClosingSpeed = speedKmPerSec * Math.max(0.2, cosDelta); // Clamp to avoid divide by zero

  if (effectiveClosingSpeed <= 0) {
    return null;
  }

  const tteSeconds = distanceKm / effectiveClosingSpeed;
  return Math.round(tteSeconds);
}

/**
 * Format TTE seconds into MM:SS format
 * @param {number|null} seconds 
 * @returns {string}
 */
export function formatTTE(seconds) {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) {
    return "--:--";
  }
  if (seconds > 3599) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `>${hrs}h ${mins}m`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
