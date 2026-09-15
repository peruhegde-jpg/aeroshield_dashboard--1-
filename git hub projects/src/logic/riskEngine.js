/**
 * AeroShield Risk Engine
 * 
 * Evaluates multi-parameter risk status combining ML microburst probability,
 * geometric proximity, trajectory heading vector alignment, and closing rate.
 * Generates transparent, human-auditable explanations for the cockpit alert state.
 */

import {
  calculateHaversineDistance,
  calculateBearing,
  calculateHeadingDelta,
  isHeadingTowardHazard,
  calculateTimeToEncounter,
  formatTTE
} from './geoCalculations';

export const RISK_LEVELS = {
  LOW: 'LOW',
  CAUTION: 'CAUTION',
  HIGH: 'HIGH'
};

/**
 * Evaluate microburst encounter risk for the current time step
 * 
 * @param {Object} params
 * @param {Object} params.aircraft - { latitude, longitude, altitude, heading, airspeed }
 * @param {Object} params.weather - { temperature, humidity, pressure, wind_speed, wind_direction, rain }
 * @param {number} params.mlProbability - Probability [0, 100]
 * @param {Object} params.hazard - { latitude, longitude, radiusKm, coreRadiusKm }
 * @param {Object} params.thresholds - Configurable thresholds
 * @returns {Object} Risk evaluation result
 */
export function evaluateRisk({
  aircraft,
  weather,
  mlProbability = 0,
  hazard,
  thresholds
}) {
  if (!aircraft || !hazard || !thresholds) {
    return {
      level: RISK_LEVELS.LOW,
      distanceKm: 0,
      bearingDeg: 0,
      headingDeltaDeg: 0,
      isApproaching: false,
      tteSeconds: null,
      tteFormatted: "--:--",
      insideHazard: false,
      insideCore: false,
      reasons: ["Insufficient telemetry or hazard configuration."],
      timestamp: Date.now()
    };
  }

  // 1. Calculate Geodesic Distance
  const distanceKm = calculateHaversineDistance(
    aircraft.latitude,
    aircraft.longitude,
    hazard.latitude,
    hazard.longitude
  );

  // 2. Calculate Bearing to Hazard
  const bearingDeg = calculateBearing(
    aircraft.latitude,
    aircraft.longitude,
    hazard.latitude,
    hazard.longitude
  );

  // 3. Trajectory Vector Alignment
  const headingDeltaDeg = calculateHeadingDelta(aircraft.heading, bearingDeg);
  const isApproaching = isHeadingTowardHazard(
    aircraft.heading,
    bearingDeg,
    thresholds.approachAngleThresholdDeg
  );

  // 4. Time-to-Encounter
  const tteSeconds = calculateTimeToEncounter(
    distanceKm,
    aircraft.airspeed,
    headingDeltaDeg
  );
  const tteFormatted = formatTTE(tteSeconds);

  // 5. Perimeter Checks
  const insideHazard = distanceKm <= hazard.radiusKm;
  const insideCore = hazard.coreRadiusKm ? distanceKm <= hazard.coreRadiusKm : false;

  // 6. Classification & Explainability Reason Generation
  const reasons = [];
  let level = RISK_LEVELS.LOW;

  const prob = Number(mlProbability) || 0;
  const dist = Number(distanceKm.toFixed(2));
  const tte = tteSeconds;

  // Evaluation criteria
  const isHighProb = prob >= thresholds.probHigh;
  const isCautionProb = prob >= thresholds.probCaution;
  const isHighDistance = dist <= thresholds.distanceHighKm;
  const isCautionDistance = dist <= thresholds.distanceCautionKm;
  const isHighTTE = tte !== null && tte <= thresholds.tteHighSec;
  const isCautionTTE = tte !== null && tte <= thresholds.tteCautionSec;

  if (insideHazard) {
    level = RISK_LEVELS.HIGH;
    reasons.push(`CRITICAL: Aircraft inside active microburst hazard boundary (${dist} km <= ${hazard.radiusKm} km radius).`);
    reasons.push(`Microburst ML probability: ${prob.toFixed(1)}% (Threshold: ${thresholds.probHigh}%).`);
    if (insideCore) {
      reasons.push(`EXTREME HAZARD: Penetrating severe downdraft core.`);
    }
  } else if (isHighProb && isApproaching && (isHighDistance || isHighTTE)) {
    level = RISK_LEVELS.HIGH;
    reasons.push(`Microburst ML probability: ${prob.toFixed(1)}% (Exceeds high threshold of ${thresholds.probHigh}%).`);
    reasons.push(`Aircraft heading toward hazard: YES (Heading ${Math.round(aircraft.heading)}° vs Bearing ${Math.round(bearingDeg)}°, Δ ${Math.round(headingDeltaDeg)}°).`);
    reasons.push(`Proximity: ${dist} km (Within high-risk perimeter ${thresholds.distanceHighKm} km).`);
    reasons.push(`Estimated encounter: ${tteFormatted} (${tte}s <= critical window of ${thresholds.tteHighSec}s).`);
  } else if (
    (isCautionProb && isApproaching && (isCautionDistance || isCautionTTE)) ||
    (isHighProb && isApproaching) ||
    (isHighProb && isCautionDistance)
  ) {
    level = RISK_LEVELS.CAUTION;
    reasons.push(`Elevated microburst probability: ${prob.toFixed(1)}% (Caution threshold: ${thresholds.probCaution}%).`);
    if (isApproaching) {
      reasons.push(`Aircraft converging toward hazard zone (Δ ${Math.round(headingDeltaDeg)}°).`);
    } else {
      reasons.push(`Aircraft trajectory tangential or diverging, but proximity is elevated.`);
    }
    reasons.push(`Distance to hazard: ${dist} km (Caution zone <= ${thresholds.distanceCautionKm} km).`);
    if (tte !== null) {
      reasons.push(`Estimated encounter: ${tteFormatted} (<= ${thresholds.tteCautionSec}s).`);
    }
  } else {
    level = RISK_LEVELS.LOW;
    if (!isCautionProb) {
      reasons.push(`Microburst probability is low (${prob.toFixed(1)}% < ${thresholds.probCaution}%).`);
    }
    if (!isApproaching) {
      reasons.push(`Aircraft heading away or clear of hazard azimuth (Δ ${Math.round(headingDeltaDeg)}° > ${thresholds.approachAngleThresholdDeg}°).`);
    }
    if (!isCautionDistance) {
      reasons.push(`Sufficient spatial separation maintained (${dist} km > ${thresholds.distanceCautionKm} km).`);
    }
    if (reasons.length === 0) {
      reasons.push(`Conditions within nominal flight safety envelope.`);
    }
  }

  return {
    level,
    distanceKm: dist,
    bearingDeg: Number(bearingDeg.toFixed(1)),
    headingDeltaDeg: Number(headingDeltaDeg.toFixed(1)),
    isApproaching,
    tteSeconds: tte,
    tteFormatted,
    insideHazard,
    insideCore,
    reasons,
    summary: `${level} RISK — ${reasons[0]}`
  };
}
