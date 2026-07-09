// ──────────────────────────────────────────────
// EVGuard — EDA Data
// ──────────────────────────────────────────────
// Realistic statistical summaries from the dataset for visualization.

export const CLASS_DISTRIBUTION = [
  { name: "Normal", count: 19554, percentage: 96.33, color: "#22C55E" },
  { name: "Critical_Overheating", count: 344, percentage: 1.69, color: "#EF4444" },
  { name: "Thermal_Overload", count: 308, percentage: 1.52, color: "#F97316" },
  { name: "Mechanical_Stress", count: 50, percentage: 0.25, color: "#EAB308" },
  { name: "Voltage_Sag", count: 44, percentage: 0.22, color: "#A855F7" },
];

export const DATASET_STATS = {
  total_rows: 20300,
  total_columns: 13,
  total_features_after_engineering: 29,
  vehicles: 500,
  time_range: "90 days",
  sampling_interval: "10 minutes",
};

export const COLUMN_STATISTICS = [
  { column: "speed_kmh", min: 0.0, max: 198.5, mean: 54.8, std: 32.1, missing_pct: 0.0, outlier_pct: 0.8 },
  { column: "distance_m", min: 0.0, max: 987654.0, mean: 245000.0, std: 185000.0, missing_pct: 0.0, outlier_pct: 0.3 },
  { column: "soc_pct", min: 0.0, max: 100.0, mean: 62.4, std: 22.8, missing_pct: 0.0, outlier_pct: 0.5 },
  { column: "battery_voltage_v", min: 250.0, max: 499.8, mean: 381.2, std: 28.5, missing_pct: 0.0, outlier_pct: 1.2 },
  { column: "battery_temp_c", min: -12.5, max: 78.9, mean: 28.3, std: 8.7, missing_pct: 0.0, outlier_pct: 2.1 },
  { column: "motor_rpm", min: 0.0, max: 11987.0, mean: 3450.0, std: 2100.0, missing_pct: 0.0, outlier_pct: 0.9 },
  { column: "motor_temp_c", min: -8.2, max: 119.5, mean: 42.1, std: 15.3, missing_pct: 0.0, outlier_pct: 1.8 },
  { column: "power_kw", min: 0.0, max: 49.8, mean: 12.5, std: 9.2, missing_pct: 0.0, outlier_pct: 0.6 },
  { column: "ambient_temp_c", min: -15.2, max: 48.5, mean: 22.1, std: 8.4, missing_pct: 0.0, outlier_pct: 0.4 },
  { column: "load_kg", min: 0.0, max: 998.0, mean: 285.0, std: 165.0, missing_pct: 0.0, outlier_pct: 0.7 },
];

export const MISSING_VALUES = [
  { column: "speed_kmh", missing: 0, percentage: 0.0 },
  { column: "distance_m", missing: 0, percentage: 0.0 },
  { column: "soc_pct", missing: 0, percentage: 0.0 },
  { column: "battery_voltage_v", missing: 0, percentage: 0.0 },
  { column: "battery_temp_c", missing: 0, percentage: 0.0 },
  { column: "motor_rpm", missing: 0, percentage: 0.0 },
  { column: "motor_temp_c", missing: 0, percentage: 0.0 },
  { column: "power_kw", missing: 0, percentage: 0.0 },
  { column: "ambient_temp_c", missing: 0, percentage: 0.0 },
  { column: "load_kg", missing: 0, percentage: 0.0 },
];

export const CORRELATION_HIGHLIGHTS = [
  { feature1: "motor_temp_c", feature2: "battery_temp_c", correlation: 0.72 },
  { feature1: "power_kw", feature2: "motor_rpm", correlation: 0.68 },
  { feature1: "speed_kmh", feature2: "motor_rpm", correlation: 0.85 },
  { feature1: "battery_voltage_v", feature2: "soc_pct", correlation: 0.91 },
  { feature1: "power_kw", feature2: "load_kg", correlation: 0.45 },
];
