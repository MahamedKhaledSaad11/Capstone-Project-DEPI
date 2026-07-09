// ──────────────────────────────────────────────
// EVGuard — Model Metrics Data
// ──────────────────────────────────────────────
// All metrics hardcoded from project evaluation results.

export const MODEL_COMPARISON = [
  { model: "LightGBM", accuracy: 0.9943, macro_f1: 0.8910, macro_precision: 0.8805, macro_recall: 0.9034, macro_auc: 0.9990, cohens_kappa: 0.9233, mcc: 0.9238 },
  { model: "XGBoost", accuracy: 0.9936, macro_f1: 0.8841, macro_precision: 0.8666, macro_recall: 0.9071, macro_auc: 0.9986, cohens_kappa: 0.9149, mcc: 0.9162 },
  { model: "Random Forest", accuracy: 0.9892, macro_f1: 0.8460, macro_precision: 0.8498, macro_recall: 0.8576, macro_auc: 0.9985, cohens_kappa: 0.8603, mcc: 0.8634 },
  { model: "SVC (RBF)", accuracy: 0.9736, macro_f1: 0.7028, macro_precision: 0.6215, macro_recall: 0.8756, macro_auc: null, cohens_kappa: 0.7146, mcc: 0.7360 },
  { model: "k-NN", accuracy: 0.9567, macro_f1: 0.6169, macro_precision: 0.5394, macro_recall: 0.8466, macro_auc: null, cohens_kappa: 0.5891, mcc: 0.6265 },
  { model: "Logistic Regression", accuracy: 0.9347, macro_f1: 0.5506, macro_precision: 0.4735, macro_recall: 0.8723, macro_auc: null, cohens_kappa: 0.4975, mcc: 0.5650 },
];

export const CONFUSION_MATRIX = {
  labels: ["Critical_Overheating", "Mechanical_Stress", "Normal", "Thermal_Overload", "Voltage_Sag"],
  matrix: [
    [67, 0, 2, 0, 0],
    [1, 9, 0, 0, 0],
    [12, 1, 3895, 0, 3],
    [0, 0, 1, 60, 0],
    [0, 0, 3, 0, 6],
  ],
};

export const PER_CLASS_METRICS = {
  Critical_Overheating: { precision: 0.8375, recall: 0.9710, f1: 0.8993 },
  Mechanical_Stress: { precision: 0.9000, recall: 0.9000, f1: 0.9000 },
  Normal: { precision: 1.0000, recall: 0.9962, f1: 0.9981 },
  Thermal_Overload: { precision: 1.0000, recall: 0.9836, f1: 0.9918 },
  Voltage_Sag: { precision: 0.6667, recall: 0.6667, f1: 0.6667 },
};

export const CROSS_VALIDATION = {
  folds: 5,
  strategy: "Stratified",
  results: {
    accuracy: { train_mean: 1.0, train_std: 0.0, test_mean: 0.9934, test_std: 0.0006 },
    macro_f1: { train_mean: 1.0, train_std: 0.0, test_mean: 0.8797, test_std: 0.0316 },
    weighted_f1: { train_mean: 1.0, train_std: 0.0, test_mean: 0.9935, test_std: 0.0006 },
    balanced_accuracy: { train_mean: 1.0, train_std: 0.0, test_mean: 0.9026, test_std: 0.0419 },
  },
};

export const ROC_AUC_PER_CLASS = {
  LightGBM: {
    Critical_Overheating: 0.999615,
    Mechanical_Stress: 0.999802,
    Normal: 0.998909,
    Thermal_Overload: 1.000000,
    Voltage_Sag: 0.996791,
    macro: 0.999023,
    weighted: 0.998935,
  },
  XGBoost: {
    Critical_Overheating: 0.999700,
    Mechanical_Stress: 1.000000,
    Normal: 0.998800,
    Thermal_Overload: 1.000000,
    Voltage_Sag: 0.994600,
    macro: 0.998600,
    weighted: 0.998800,
  },
  "Random Forest": {
    Critical_Overheating: 0.999200,
    Mechanical_Stress: 1.000000,
    Normal: 0.997900,
    Thermal_Overload: 1.000000,
    Voltage_Sag: 0.995700,
    macro: 0.998500,
    weighted: 0.997900,
  },
};

export const FEATURE_IMPORTANCE = [
  { rank: 1, feature: "battery_voltage_v_roll_mean", displayName: "Battery Voltage Trend", gain: 0.1677, split: 0.0224 },
  { rank: 2, feature: "motor_temp_c_roll_mean", displayName: "Motor Temp Trend", gain: 0.1540, split: 0.0312 },
  { rank: 3, feature: "battery_temp_c_roll_mean", displayName: "Battery Temp Trend", gain: 0.1102, split: 0.0287 },
  { rank: 4, feature: "power_kw_roll_mean", displayName: "Power Trend", gain: 0.0832, split: 0.0245 },
  { rank: 5, feature: "battery_temp_c", displayName: "Battery Temperature", gain: 0.0615, split: 0.0398 },
  { rank: 6, feature: "motor_temp_c", displayName: "Motor Temperature", gain: 0.0580, split: 0.0421 },
  { rank: 7, feature: "battery_voltage_v", displayName: "Battery Voltage", gain: 0.0478, split: 0.0356 },
  { rank: 8, feature: "temp_diff_motor_ambient", displayName: "Motor-Ambient Temp Diff", gain: 0.0421, split: 0.0334 },
  { rank: 9, feature: "power_kw", displayName: "Power Consumption", gain: 0.0390, split: 0.0312 },
  { rank: 10, feature: "temp_diff_battery_ambient", displayName: "Battery-Ambient Temp Diff", gain: 0.0355, split: 0.0298 },
  { rank: 11, feature: "voltage_per_soc", displayName: "Voltage per SoC", gain: 0.0310, split: 0.0276 },
  { rank: 12, feature: "soc_pct", displayName: "State of Charge", gain: 0.0275, split: 0.0345 },
  { rank: 13, feature: "speed_kmh", displayName: "Vehicle Speed", gain: 0.0198, split: 0.0267 },
  { rank: 14, feature: "motor_rpm", displayName: "Motor RPM", gain: 0.0178, split: 0.0234 },
  { rank: 15, feature: "ambient_temp_c", displayName: "Ambient Temperature", gain: 0.0155, split: 0.0213 },
  { rank: 16, feature: "power_to_load_ratio", displayName: "Power-to-Load Ratio", gain: 0.0140, split: 0.0198 },
  { rank: 17, feature: "load_kg", displayName: "Vehicle Load", gain: 0.0125, split: 0.0187 },
  { rank: 18, feature: "speed_x_load", displayName: "Speed x Load", gain: 0.0112, split: 0.0176 },
  { rank: 19, feature: "distance_m", displayName: "Distance Traveled", gain: 0.0098, split: 0.0165 },
  { rank: 20, feature: "battery_voltage_v_roll_std", displayName: "Battery Voltage Variability", gain: 0.0085, split: 0.0145 },
  { rank: 21, feature: "motor_temp_c_roll_std", displayName: "Motor Temp Variability", gain: 0.0076, split: 0.0132 },
  { rank: 22, feature: "hour_of_day", displayName: "Hour of Day", gain: 0.0072, split: 0.0156 },
  { rank: 23, feature: "battery_temp_c_roll_std", displayName: "Battery Temp Variability", gain: 0.0068, split: 0.0123 },
  { rank: 24, feature: "power_kw_roll_std", displayName: "Power Variability", gain: 0.0060, split: 0.0112 },
  { rank: 25, feature: "day_of_week", displayName: "Day of Week", gain: 0.0058, split: 0.0098 },
];

export const CHAMPION_METRICS = {
  accuracy: 0.9943,
  macro_f1: 0.8910,
  macro_auc: 0.9990,
  cohens_kappa: 0.9233,
  mcc: 0.9238,
  training_samples: 16240,
  test_samples: 4060,
  feature_count: 25,
};
