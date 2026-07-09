import { FAILURE_COLORS } from "../../constants/colors";
import { formatClassName } from "../../utils/formatters";

export default function ConfusionMatrix({ data }) {
  if (!data) return null;

  const { labels, matrix } = data;

  const getIntensity = (value, rowMax) => {
    if (rowMax === 0) return 0;
    return value / rowMax;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Header label */}
        <div className="text-center text-xs text-slate-400 mb-2 font-medium">
          Predicted Label
        </div>

        <div className="flex">
          {/* Y-axis label */}
          <div className="flex items-center mr-2">
            <span
              className="text-xs text-slate-400 font-medium"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              True Label
            </span>
          </div>

          <div className="flex-1">
            {/* Column headers */}
            <div className="flex ml-[120px]">
              {labels.map((label) => (
                <div
                  key={label}
                  className="flex-1 text-center text-[10px] text-slate-400 pb-2 truncate px-1"
                  title={formatClassName(label)}
                >
                  {formatClassName(label).split(" ")[0]}
                </div>
              ))}
            </div>

            {/* Matrix rows */}
            {matrix.map((row, i) => {
              const rowMax = Math.max(...row);
              return (
                <div key={labels[i]} className="flex items-center mb-1">
                  {/* Row label */}
                  <div
                    className="w-[120px] text-right pr-3 text-xs truncate"
                    style={{ color: FAILURE_COLORS[labels[i]] || "#94A3B8" }}
                    title={formatClassName(labels[i])}
                  >
                    {formatClassName(labels[i])}
                  </div>

                  {/* Row cells */}
                  {row.map((value, j) => {
                    const intensity = getIntensity(value, rowMax);
                    const isDiagonal = i === j;
                    const bgColor = isDiagonal
                      ? `rgba(99, 102, 241, ${0.15 + intensity * 0.6})`
                      : value > 0
                      ? `rgba(239, 68, 68, ${0.1 + intensity * 0.4})`
                      : "rgba(255, 255, 255, 0.02)";

                    return (
                      <div
                        key={`${i}-${j}`}
                        className="flex-1 aspect-square flex items-center justify-center text-xs font-mono mx-0.5 rounded-lg transition-colors"
                        style={{ backgroundColor: bgColor }}
                      >
                        <span
                          className={`font-semibold ${
                            value > 0 ? "text-white" : "text-slate-600"
                          }`}
                        >
                          {value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
