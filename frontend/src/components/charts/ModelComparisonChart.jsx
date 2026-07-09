import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell,
} from "recharts";

const METRIC_COLORS = {
  accuracy: "#6366F1",
  macro_f1: "#22C55E",
  macro_auc: "#F59E0B",
  mcc: "#A855F7",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-secondary/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-white text-sm font-semibold mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value?.toFixed(4) || "N/A"}
        </p>
      ))}
    </div>
  );
};

export default function ModelComparisonChart({ data, metric = "accuracy" }) {
  if (!data) return null;

  const chartData = data.map((item) => ({
    ...item,
    displayAccuracy: item.accuracy * 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="model"
          tick={{ fill: "#94A3B8", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          angle={-20}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fill: "#94A3B8", fontSize: 12 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          domain={[0, 1]}
          tickFormatter={(v) => v.toFixed(2)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Legend wrapperStyle={{ color: "#94A3B8" }} />
        <Bar dataKey="accuracy" name="Accuracy" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={50}>
          {chartData.map((entry, index) => (
            <Cell
              key={entry.model}
              fill={index === 0 ? "#6366F1" : `rgba(99, 102, 241, ${0.3 + (1 - index / chartData.length) * 0.4})`}
            />
          ))}
        </Bar>
        <Bar dataKey="macro_f1" name="Macro F1" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={50}>
          {chartData.map((entry, index) => (
            <Cell
              key={entry.model}
              fill={index === 0 ? "#22C55E" : `rgba(34, 197, 94, ${0.3 + (1 - index / chartData.length) * 0.4})`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
