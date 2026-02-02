import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

// Vibrant "Tech" Palette
const COLORS = [
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#8b5cf6", // Violet
  "#14b8a6", // Teal
  "#f59e0b", // Amber
  "#3b82f6", // Blue
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 text-white text-xs rounded-lg p-3 shadow-xl">
        <p className="font-bold mb-1 text-base capitalize">{payload[0].name}</p>
        <p className="opacity-80">
          Share:{" "}
          <span className="font-mono font-bold text-emerald-400">
            {payload[0].value}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function BrandChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        No brand data
      </div>
    );
  }

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

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
                fill={COLORS[index % COLORS.length]}
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
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label for 3D/Donut Effect */}
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
