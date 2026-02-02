import { Layers, Recycle, Scale, Award } from "lucide-react";

// 1. Update Card component to accept 'badgeTheme' prop
const Card = ({
  label,
  value,
  icon: Icon,
  colorClass,
  subtext,
  gradient,
  badgeTheme,
}) => (
  <div className="glass-card relative overflow-hidden rounded-2xl p-6 group">
    {/* Background Gradient Blob */}
    <div
      className={`absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-10 blur-2xl transition-all duration-500 group-hover:opacity-20 ${colorClass.replace("bg-", "bg-")}`}
    />

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
        >
          <Icon size={24} />
        </div>

        {subtext && (
          // 2. Use the 'badgeTheme' class if provided, otherwise fallback to gray
          <span
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wide shadow-sm ${
              badgeTheme || "bg-slate-100 text-slate-500 border-slate-200"
            }`}
          >
            {subtext}
          </span>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-800 tracking-tight">
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default function SummaryCards({ analytics }) {
  const petCount = analytics.pet_bottles || 0;
  const nonPetCount = analytics.non_pet_bottles || 0;

  // Format the ratio string
  const ratioString = `${petCount}:${nonPetCount}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <Card
        label="Total Bottles"
        value={analytics.total_bottles}
        icon={Layers}
        colorClass="bg-blue-500"
        gradient="from-blue-500 to-indigo-600"
        subtext="Detected"
        badgeTheme="bg-blue-50 text-blue-600 border-blue-200"
      />

      {/* 3. Highlight the Ratio in Green/Emerald */}
      <Card
        label="PET Purity"
        value={`${analytics.pet_purity_percent}%`}
        icon={Recycle}
        colorClass="bg-emerald-500"
        gradient="from-emerald-500 to-teal-600"
        subtext={`Ratio ${ratioString}`}
        // ✅ THIS IS THE FIX: Strong Emerald Badge
        badgeTheme="bg-emerald-100 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20"
      />

      <Card
        label="Total Weight"
        value={`${analytics.total_weight_kg} kg`}
        icon={Scale}
        colorClass="bg-amber-500"
        gradient="from-amber-400 to-orange-500"
        subtext="Est. Yield"
        badgeTheme="bg-amber-50 text-amber-700 border-amber-200"
      />

      <Card
        label="Quality Grade"
        value={analytics.quality_grade}
        icon={Award}
        colorClass="bg-purple-500"
        gradient="from-purple-500 to-violet-600"
        subtext="Ranking"
        badgeTheme="bg-purple-50 text-purple-700 border-purple-200"
      />
    </div>
  );
}
