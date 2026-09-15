/**
 * AeroShield ML Model Validation Statistics
 * 
 * Held-out test set benchmark for the Random Forest Microburst Classifier.
 * 
 * IMPORTANT: These values represent supplied experimental prototype validation results.
 * Not certified for operational aviation meteorology.
 */

export const ML_VALIDATION_STATS = {
  modelName: "Random Forest Classifier",
  ensembleSize: 100,
  criterion: "Gini Impurity",
  accuracy: 89.8,
  accuracyFormatted: "89.8%",
  totalTestSamples: 186,
  correctPredictions: 167,
  incorrectPredictions: 19,
  macroF1Score: 0.884,
  aucRoc: 0.942,
  datasetSplit: "70% Train / 15% Val / 15% Test",
  labels: {
    datasetTag: "Held-out test set",
    disclaimerTag: "Experimental / prototype validation"
  },
  
  // Confusion Matrix for NORM, WET, DRY Microburst Classes
  confusionMatrix: {
    classes: ["NORM", "WET", "DRY"],
    matrix: [
      // True NORM (92 total): [Pred NORM: 87, Pred WET: 4, Pred DRY: 1]
      { trueClass: "NORM", predictions: { NORM: 87, WET: 4, DRY: 1 }, total: 92, recall: "94.6%" },
      // True WET (64 total): [Pred NORM: 3, Pred WET: 59, Pred DRY: 2]
      { trueClass: "WET", predictions: { NORM: 3, WET: 59, DRY: 2 }, total: 64, recall: "92.2%" },
      // True DRY (30 total): [Pred NORM: 1, Pred WET: 8, Pred DRY: 21]
      { trueClass: "DRY", predictions: { NORM: 1, WET: 8, DRY: 21 }, total: 30, recall: "70.0%" }
    ]
  },

  // Feature Importance weights extracted from the trained model
  featureImportance: [
    { feature: "humidity_change", importance: 0.28, description: "Rate of ambient relative humidity change (dH/dt)", scoreFormatted: "28.0%" },
    { feature: "precipitation", importance: 0.22, description: "Instantaneous precipitation intensity index", scoreFormatted: "22.0%" },
    { feature: "humidity", importance: 0.18, description: "Surface level ambient relative humidity (%)", scoreFormatted: "18.0%" },
    { feature: "wind_speed_roll_std", importance: 0.14, description: "Rolling 5-min standard deviation of wind speed (turbulence)", scoreFormatted: "14.0%" },
    { feature: "wind_speed", importance: 0.11, description: "Instantaneous horizontal wind speed (m/s)", scoreFormatted: "11.0%" },
    { feature: "wind_speed_rate", importance: 0.07, description: "Gust acceleration vector rate (dV_w/dt)", scoreFormatted: "7.0%" }
  ]
};
