import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import Card from "../../../components/ui/Card";
import FEATURE_METADATA, { FEATURE_CATEGORIES } from "../../../data/featureMetadata";

export default function Features() {
  const grouped = {
    sensor: FEATURE_METADATA.filter((f) => f.category === "sensor"),
    engineered: FEATURE_METADATA.filter((f) => f.category === "engineered"),
    rolling: FEATURE_METADATA.filter((f) => f.category === "rolling"),
    temporal: FEATURE_METADATA.filter((f) => f.category === "temporal"),
  };

  return (
    <div className="min-h-screen pt-20">
      <section className="section-padding">
        <div className="max-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Phase 4: <span className="gradient-text">Feature Engineering</span>
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              Transforming 10 raw sensor columns into 25 predictive features through
              physics-informed engineering, rolling statistics, and temporal extraction.
            </p>
          </motion.div>

          {/* Category Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {Object.entries(FEATURE_CATEGORIES).map(([key, cat]) => (
              <Card key={key} hover={false}>
                <div className="w-3 h-3 rounded-full mb-3" style={{ backgroundColor: cat.color }} />
                <p className="text-2xl font-bold text-white">{cat.count}</p>
                <p className="text-sm text-slate-400">{cat.label}</p>
              </Card>
            ))}
          </div>

          {/* Feature Groups */}
          {Object.entries(grouped).map(([category, features]) => (
            <div key={category} className="mb-10">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: FEATURE_CATEGORIES[category].color }} />
                {FEATURE_CATEGORIES[category].label} Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <motion.div
                    key={feature.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-4 rounded-xl bg-bg-secondary border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{feature.icon}</span>
                        <h3 className="font-semibold text-white">{feature.displayName}</h3>
                      </div>
                      {feature.unit && (
                        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                          {feature.unit}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{feature.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="font-mono">name: {feature.name}</span>
                      <span>Range: [{feature.min}, {feature.max}]</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
