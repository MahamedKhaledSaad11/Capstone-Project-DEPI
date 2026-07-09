import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend,
} from "recharts";
import { FAILURE_COLORS } from "../../constants/colors";
import { formatClassName } from "../../utils/formatters";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-bg-secondary/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-white text-sm font-semibold">{data.displayName}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {(entry.value * 100).toFixed(2)}%
        </p>
      ))}
    </div>
  );
};

export default function ROCCurveChart({ data }) {
  if (!data) return null;

  const classes = Object.keys(data).filter(
    (k) => k !== "macro" && k !== "weighted"
  );

  const chartData = classes.map((cls) => ({
    name: cls,
    displayName: formatClassName(cls),
    auc: data[cls],
    color: FAILURE_COLORS[cls] || "#6366F1",
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="displayName"
          tick={{ fill: "#94A3B8", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <YAxis
          domain={[0.99, 1.001]}
          tick={{ fill: "#94A3B8", fontSize: 12 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tickFormatter={(v) => v.toFixed(3)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="auc" name="AUC" radius={[6, 6, 0, 0]} maxBarSize={60}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
