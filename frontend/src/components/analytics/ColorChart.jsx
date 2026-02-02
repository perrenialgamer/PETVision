import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

// Map detected color names to actual CSS colors for better UX
const COLOR_MAP = {
  transparent: "#e2e8f0", // Slate-200
  clear: "#cbd5e1", // Slate-300
  green: "#22c55e", // Green-500
  blue: "#3b82f6", // Blue-500
  brown: "#d97706", // Amber-600
  amber: "#b45309", // Amber-700
  dark: "#1e293b", // Slate-800
  other: "#94a3b8", // Slate-400
};

// Fallback palette if color name isn't found
const FALLBACK_COLORS = ["#10b981", "#06b6d4", "#8b5cf6", "#f43f5e"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 text-white text-xs rounded-lg p-3 shadow-xl">
        <p className="font-bold mb-1 text-base capitalize">
          {payload[0].name.replace("_", " ")}
        </p>
        <p className="opacity-80">
          Count:{" "}
          <span className="font-mono font-bold text-emerald-400">
            {payload[0].value}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ColorChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        No color data
      </div>
    );
  }

  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name,
    value,
  }));

  const getColor = (name, index) => {
    // Try to find a partial match (e.g., "light_blue" -> contains "blue")
    const lowerName = name.toLowerCase();
    for (const [key, color] of Object.entries(COLOR_MAP)) {
      if (lowerName.includes(key)) return color;
    }
    return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  };

  return (
    <div className="h-[320px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            cornerRadius={8}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColor(entry.name, index)}
                className="hover:opacity-80 transition-opacity duration-300 cursor-pointer filter drop-shadow-lg"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-slate-600 text-sm font-medium ml-1 capitalize">
                {value.replace("_", " ")}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-4 text-center pointer-events-none">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          Total
        </p>
        <p className="text-2xl font-black text-slate-800">
          {chartData.reduce((acc, curr) => acc + curr.value, 0)}
        </p>
      </div>
    </div>
  );
}
