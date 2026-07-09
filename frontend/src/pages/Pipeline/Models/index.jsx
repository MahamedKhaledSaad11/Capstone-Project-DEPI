import { motion } from "framer-motion";
import { Cpu, Trophy } from "lucide-react";
import Card from "../../../components/ui/Card";
import ModelComparisonChart from "../../../components/charts/ModelComparisonChart";
import { MODEL_COMPARISON } from "../../../data/modelMetrics";
import { formatMetric } from "../../../utils/formatters";

export default function Models() {
  return (
    <div className="min-h-screen pt-20">
      <section className="section-padding">
        <div className="max-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Phase 5: <span className="gradient-text">Model Training</span>
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              Six candidate models trained with ADASYN-balanced data,
              evaluated using stratified 5-fold cross-validation.
            </p>
          </motion.div>

          {/* Champion Banner */}
          <Card className="mb-8 border-accent/20" glow>
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Champion Model: LightGBM</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Accuracy", value: "99.43%" },
                { label: "Macro F1", value: "0.8910" },
                { label: "Macro AUC", value: "0.9990" },
                { label: "MCC", value: "0.9238" },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <p className="text-2xl font-bold gradient-text">{m.value}</p>
                  <p className="text-xs text-slate-400">{m.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Comparison Chart */}
          <Card hover={false} className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-accent" /> Model Comparison
            </h3>
            <ModelComparisonChart data={MODEL_COMPARISON} />
          </Card>

          {/* Comparison Table */}
          <Card hover={false}>
            <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Model", "Accuracy", "Macro F1", "Precision", "Recall", "AUC", "Kappa", "MCC"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-slate-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODEL_COMPARISON.map((m, i) => (
                    <tr
                      key={m.model}
                      className={`border-b border-white/5 ${i === 0 ? "bg-accent/5" : "hover:bg-white/[0.02]"}`}
                    >
                      <td className="py-2.5 px-3 font-medium text-white">
                        {i === 0 && <span className="text-yellow-400 mr-1">🏆</span>}
                        {m.model}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatMetric(m.accuracy)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatMetric(m.macro_f1)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatMetric(m.macro_precision)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatMetric(m.macro_recall)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{m.macro_auc ? formatMetric(m.macro_auc) : "N/A"}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatMetric(m.cohens_kappa)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatMetric(m.mcc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
