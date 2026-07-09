import { motion } from "framer-motion";
import { Settings, Check, ArrowRight } from "lucide-react";
import Card from "../../../components/ui/Card";

const steps = [
  { step: 1, title: "Chronological Sorting", description: "Sort all records by [car_id, timestamp] to preserve temporal ordering for rolling window calculations.", detail: "Ensures per-vehicle time-series integrity" },
  { step: 2, title: "Duplicate Removal", description: "Remove exact-row duplicates and same (car_id, timestamp) duplicate entries, keeping first occurrence.", detail: "0 duplicates found in cleaned data" },
  { step: 3, title: "Physical Constraint Clamping", description: "Enforce domain-driven bounds on 10 sensor columns (e.g., speed 0-200 km/h, SoC 0-100%, voltage 250-500V).", detail: "Prevents physically impossible values" },
  { step: 4, title: "Missing Value Imputation", description: "Per-vehicle forward-fill then backward-fill for temporal continuity. Remaining NaN filled with global column median.", detail: "Zero NaN values after imputation" },
  { step: 5, title: "Data Validation", description: "Assert zero NaN, zero infinities, and physical bounds respected. All 3 validation checks must pass.", detail: "All checks PASSED" },
];

const clampingRules = [
  { column: "speed_kmh", min: 0, max: 200 },
  { column: "soc_pct", min: 0, max: 100 },
  { column: "battery_voltage_v", min: 250, max: 500 },
  { column: "battery_temp_c", min: -40, max: 80 },
  { column: "motor_rpm", min: 0, max: 12000 },
  { column: "motor_temp_c", min: -20, max: 120 },
  { column: "power_kw", min: 0, max: 50 },
  { column: "ambient_temp_c", min: -50, max: 60 },
  { column: "load_kg", min: 0, max: 1000 },
];

export default function Preprocessing() {
  return (
    <div className="min-h-screen pt-20">
      <section className="section-padding">
        <div className="max-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Phase 3: <span className="gradient-text">Data Preparation</span>
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              Cleaning, clamping, imputing, and validating the raw telemetry data
              to produce a reliable, ML-ready dataset.
            </p>
          </motion.div>

          {/* Pipeline Steps */}
          <div className="space-y-4 mb-12">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-5 rounded-xl bg-bg-secondary border border-white/5"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent font-bold">{s.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-400 mb-2">{s.description}</p>
                  <div className="flex items-center gap-1.5 text-xs text-success">
                    <Check className="w-3.5 h-3.5" />
                    {s.detail}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Clamping Rules */}
          <Card hover={false}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-accent" /> Physical Clamping Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {clampingRules.map((rule) => (
                <div key={rule.column} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="font-mono text-sm text-accent">{rule.column}</span>
                  <span className="text-sm text-slate-300 font-mono">
                    [{rule.min}, {rule.max}]
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
