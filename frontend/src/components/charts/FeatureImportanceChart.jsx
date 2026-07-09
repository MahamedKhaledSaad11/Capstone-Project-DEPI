import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-bg-secondary/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-white text-sm font-semibold">{data.displayName}</p>
      <p className="text-accent text-sm">Gain: {(data.gain * 100).toFixed(2)}%</p>
    </div>
  );
};

export default function FeatureImportanceChart({ data, maxItems = 15 }) {
  const chartData = (data || [])
    .slice(0, maxItems)
    .map((item) => ({
      ...item,
      gainPct: item.gain * 100,
    }))
    .reverse();

  return (
    <ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 30)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "#94A3B8", fontSize: 12 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tickFormatter={(v) => `${v.toFixed(1)}%`}
        />
        <YAxis
          type="category"
          dataKey="displayName"
          tick={{ fill: "#CBD5E1", fontSize: 11 }}
          width={160}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="gainPct" radius={[0, 6, 6, 0]} maxBarSize={20}>
          {chartData.map((entry, index) => (
            <Cell
              key={entry.feature}
              fill={`rgba(99, 102, 241, ${0.4 + (index / chartData.length) * 0.6})`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
