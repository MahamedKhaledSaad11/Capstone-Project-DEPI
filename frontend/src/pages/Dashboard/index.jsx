import { motion } from "framer-motion";
import { BarChart3, Activity, Shield, TrendingUp } from "lucide-react";
import Card from "../../components/ui/Card";
import ConfusionMatrix from "../../components/charts/ConfusionMatrix";
import FeatureImportanceChart from "../../components/charts/FeatureImportanceChart";
import ModelComparisonChart from "../../components/charts/ModelComparisonChart";
import ROCCurveChart from "../../components/charts/ROCCurveChart";
import { CONFUSION_MATRIX, FEATURE_IMPORTANCE, MODEL_COMPARISON, ROC_AUC_PER_CLASS, CHAMPION_METRICS, PER_CLASS_METRICS } from "../../data/modelMetrics";
import { FAILURE_COLORS } from "../../constants/colors";
import useCountUp from "../../hooks/useCountUp";

function MetricCard({ label, value, suffix = "", decimals = 2, icon: Icon }) {
  const { value: animatedValue, ref } = useCountUp(value, 2000, decimals);
  return (
    <Card hover={false} ref={ref}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{animatedValue}{suffix}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen pt-20">
      <section className="section-padding">
        <div className="max-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Model <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              Comprehensive overview of the LightGBM champion model performance,
              feature importance, and evaluation metrics.
            </p>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard label="Accuracy" value={99.43} suffix="%" decimals={2} icon={Shield} />
            <MetricCard label="Macro F1" value={0.891} suffix="" decimals={3} icon={Activity} />
            <MetricCard label="Macro AUC" value={0.999} suffix="" decimals={3} icon={TrendingUp} />
            <MetricCard label="Features" value={25} suffix="" decimals={0} icon={BarChart3} />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card hover={false}>
              <h3 className="text-lg font-semibold mb-4">Confusion Matrix</h3>
              <ConfusionMatrix data={CONFUSION_MATRIX} />
            </Card>
            <Card hover={false}>
              <h3 className="text-lg font-semibold mb-4">Per-Class Metrics</h3>
              <div className="space-y-3">
                {Object.entries(PER_CLASS_METRICS).map(([cls, m]) => (
                  <div key={cls} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: FAILURE_COLORS[cls] }} />
                    <span className="text-sm text-white w-40 truncate">{cls.replace('_', ' ')}</span>
                    <div className="flex-1 grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <span className="text-slate-500 block">P</span>
                        <span className="font-mono text-slate-200">{m.precision.toFixed(3)}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-slate-500 block">R</span>
                        <span className="font-mono text-slate-200">{m.recall.toFixed(3)}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-slate-500 block">F1</span>
                        <span className="font-mono text-slate-200">{m.f1.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card hover={false}>
              <h3 className="text-lg font-semibold mb-4">Model Comparison</h3>
              <ModelComparisonChart data={MODEL_COMPARISON} />
            </Card>
            <Card hover={false}>
              <h3 className="text-lg font-semibold mb-4">ROC AUC per Class</h3>
              <ROCCurveChart data={ROC_AUC_PER_CLASS.LightGBM} />
            </Card>
          </div>

          {/* Feature Importance */}
          <Card hover={false}>
            <h3 className="text-lg font-semibold mb-4">Top 15 Feature Importance</h3>
            <FeatureImportanceChart data={FEATURE_IMPORTANCE} maxItems={15} />
          </Card>
        </div>
      </section>
    </div>
  );
}
