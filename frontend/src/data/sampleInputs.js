// ──────────────────────────────────────────────
// EVGuard — Sample Inputs
// ──────────────────────────────────────────────

export const SAMPLE_INPUTS = {
  healthy: {
    label: "Healthy EV",
    description: "Normal operating conditions",
    color: "green",
    data: {
      speed_kmh: 65.0,
      distance_m: 150000.0,
      soc_pct: 78.0,
      battery_voltage_v: 390.0,
      battery_temp_c: 28.0,
      motor_rpm: 3500.0,
      motor_temp_c: 42.0,
      power_kw: 9.0,
      ambient_temp_c: 22.0,
      load_kg: 220.0,
      hour_of_day: 10,
      day_of_week: 1,
    },
  },
  warning: {
    label: "Thermal Warning",
    description: "Elevated temperatures detected",
    color: "orange",
    data: {
      speed_kmh: 95.0,
      distance_m: 280000.0,
      soc_pct: 45.0,
      battery_voltage_v: 355.0,
      battery_temp_c: 58.0,
      motor_rpm: 7200.0,
      motor_temp_c: 88.0,
      power_kw: 38.0,
      ambient_temp_c: 38.0,
      load_kg: 520.0,
      hour_of_day: 14,
      day_of_week: 3,
    },
  },
  critical: {
    label: "Critical Failure Risk",
    description: "Multiple systems in danger zone",
    color: "red",
    data: {
      speed_kmh: 140.0,
      distance_m: 420000.0,
      soc_pct: 12.0,
      battery_voltage_v: 298.0,
      battery_temp_c: 74.0,
      motor_rpm: 10500.0,
      motor_temp_c: 112.0,
      power_kw: 47.0,
      ambient_temp_c: 42.0,
      load_kg: 850.0,
      hour_of_day: 15,
      day_of_week: 4,
    },
  },
};

export default SAMPLE_INPUTS;
