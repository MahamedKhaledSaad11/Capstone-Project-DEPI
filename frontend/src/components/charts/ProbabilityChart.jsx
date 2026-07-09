import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { FAILURE_COLORS } from "../../constants/colors";
import { formatClassName } from "../../utils/formatters";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-bg-secondary/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-white text-sm font-semibold">{data.displayName}</p>
      <p className="text-accent text-sm">{(data.probability * 100).toFixed(2)}%</p>
    </div>
  );
};

export default function ProbabilityChart({ probabilities }) {
  if (!probabilities) return null;

  const chartData = Object.entries(probabilities).map(([cls, prob]) => ({
    name: cls,
    displayName: formatClassName(cls),
    probability: prob,
    color: FAILURE_COLORS[cls] || "#6366F1",
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
        <XAxis
          dataKey="displayName"
          tick={{ fill: "#94A3B8", fontSize: 10 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <YAxis
          domain={[0, 1]}
          tick={{ fill: "#94A3B8", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="probability" radius={[6, 6, 0, 0]} maxBarSize={60}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
