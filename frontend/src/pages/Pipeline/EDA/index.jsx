import { motion } from "framer-motion";
import { BarChart2, PieChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart as RPieChart, Pie } from "recharts";
import Card from "../../../components/ui/Card";
import { CLASS_DISTRIBUTION, COLUMN_STATISTICS, CORRELATION_HIGHLIGHTS } from "../../../data/edaData";
import { FAILURE_COLORS } from "../../../constants/colors";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-bg-secondary/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-white text-sm font-semibold">{d.name || d.column}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm" style={{ color: p.color || "#6366F1" }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function EDA() {
  return (
    <div className="min-h-screen pt-20">
      <section className="section-padding">
        <div className="max-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Phase 2: <span className="gradient-text">Exploratory Data Analysis</span>
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              Statistical profiling, distribution analysis, and correlation exploration
              to understand data patterns and inform preprocessing decisions.
            </p>
          </motion.div>

          {/* Class Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card hover={false}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-accent" /> Class Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <RPieChart>
                  <Pie
                    data={CLASS_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="name"
                    paddingAngle={2}
                  >
                    {CLASS_DISTRIBUTION.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RPieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {CLASS_DISTRIBUTION.map((cls) => (
                  <div key={cls.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cls.color }} />
                    {cls.name.replace('_', ' ')} ({cls.percentage}%)
                  </div>
                ))}
              </div>
            </Card>

            <Card hover={false}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-accent" /> Key Imbalance Insight
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-warning/5 border border-warning/10">
                  <h4 className="text-warning font-semibold mb-2">Severe Class Imbalance Detected</h4>
                  <p className="text-sm text-slate-400">
                    Normal class dominates at 96.33% while Voltage_Sag is only 0.22%.
                    This imbalance ratio of 444:1 requires ADASYN oversampling during training
                    to prevent the model from becoming a majority-class predictor.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                  <h4 className="text-accent font-semibold mb-2">Solution Applied</h4>
                  <p className="text-sm text-slate-400">
                    ADASYN (Adaptive Synthetic Sampling) applied only on training folds,
                    balancing all 5 classes to ~15,600 samples each. Test set remains untouched
                    to ensure realistic evaluation metrics.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Column Statistics */}
          <Card hover={false} className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Feature Statistics Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Column", "Min", "Max", "Mean", "Std", "Outlier %"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-slate-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COLUMN_STATISTICS.map((col) => (
                    <tr key={col.column} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-mono text-accent">{col.column}</td>
                      <td className="py-2.5 px-3 text-slate-300">{col.min.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-slate-300">{col.max.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-slate-300">{col.mean.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-slate-300">{col.std.toFixed(1)}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${col.outlier_pct > 1.5 ? 'text-warning bg-warning/10' : 'text-success bg-success/10'}`}>
                          {col.outlier_pct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Correlations */}
          <Card hover={false}>
            <h3 className="text-lg font-semibold mb-4">Top Correlations</h3>
            <div className="space-y-3">
              {CORRELATION_HIGHLIGHTS.map((c) => (
                <div key={`${c.feature1}-${c.feature2}`} className="flex items-center gap-4">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-mono text-sm text-accent">{c.feature1}</span>
                    <span className="text-slate-500">↔</span>
                    <span className="font-mono text-sm text-accent">{c.feature2}</span>
                  </div>
                  <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${c.correlation * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-white w-12 text-right">
                    {c.correlation.toFixed(2)}
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
