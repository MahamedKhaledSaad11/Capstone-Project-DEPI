import { motion } from "framer-motion";
import { Award } from "lucide-react";
import Card from "../../../components/ui/Card";
import ConfusionMatrix from "../../../components/charts/ConfusionMatrix";
import FeatureImportanceChart from "../../../components/charts/FeatureImportanceChart";
import ROCCurveChart from "../../../components/charts/ROCCurveChart";
import { CONFUSION_MATRIX, PER_CLASS_METRICS, CROSS_VALIDATION, ROC_AUC_PER_CLASS, FEATURE_IMPORTANCE } from "../../../data/modelMetrics";
import { FAILURE_COLORS } from "../../../constants/colors";
import { formatMetric } from "../../../utils/formatters";

export default function Evaluation() {
  return (
    <div className="min-h-screen pt-20">
      <section className="section-padding">
        <div className="max-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Phase 6: <span className="gradient-text">Model Evaluation</span>
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              Comprehensive evaluation with confusion matrices, per-class metrics,
              ROC AUC analysis, cross-validation, and feature importance.
            </p>
          </motion.div>

          {/* Confusion Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card hover={false}>
              <h3 className="text-lg font-semibold mb-4">Confusion Matrix (LightGBM)</h3>
              <ConfusionMatrix data={CONFUSION_MATRIX} />
            </Card>

            <Card hover={false}>
              <h3 className="text-lg font-semibold mb-4">Per-Class Performance</h3>
              <div className="space-y-3">
                {Object.entries(PER_CLASS_METRICS).map(([cls, metrics]) => (
                  <div key={cls} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: FAILURE_COLORS[cls] }} />
                      <span className="font-medium text-white text-sm">{cls.replace('_', ' ')}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Precision</span>
                        <p className="font-mono text-slate-200">{formatMetric(metrics.precision)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Recall</span>
                        <p className="font-mono text-slate-200">{formatMetric(metrics.recall)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">F1</span>
                        <p className="font-mono text-slate-200">{formatMetric(metrics.f1)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ROC AUC */}
          <Card hover={false} className="mb-8">
            <h3 className="text-lg font-semibold mb-4">ROC AUC per Class (LightGBM)</h3>
            <ROCCurveChart data={ROC_AUC_PER_CLASS.LightGBM} />
          </Card>

          {/* Cross-Validation */}
          <Card hover={false} className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" /> 5-Fold Stratified Cross-Validation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(CROSS_VALIDATION.results).map(([metric, vals]) => (
                <div key={metric} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-xs text-slate-400 mb-1 capitalize">{metric.replace('_', ' ')}</p>
                  <p className="text-xl font-bold text-white">{vals.test_mean.toFixed(4)}</p>
                  <p className="text-xs text-slate-500">± {vals.test_std.toFixed(4)}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Feature Importance */}
          <Card hover={false}>
            <h3 className="text-lg font-semibold mb-4">Feature Importance (Gain)</h3>
            <FeatureImportanceChart data={FEATURE_IMPORTANCE} />
          </Card>
        </div>
      </section>
    </div>
  );
}
