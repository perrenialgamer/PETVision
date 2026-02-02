import ImageInspection from "./ImageInspection";
import { Package, Award, Scale, AlertTriangle } from "lucide-react";

export default function ImageAnalyticsCard({ image }) {
  const a = image.image_analytics;

  return (
    <div className="glass-card rounded-2xl p-5 break-inside-avoid">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
            <Package size={16} />
          </div>
          <h3 className="text-sm font-bold text-slate-700 font-mono">
            {image.image_id}
          </h3>
        </div>

        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold ${
            a.quality_grade === "A"
              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
              : "bg-amber-50 border-amber-100 text-amber-700"
          }`}
        >
          {a.quality_grade === "A" ? (
            <Award size={12} />
          ) : (
            <AlertTriangle size={12} />
          )}
          Grade {a.quality_grade}
        </div>
      </div>

      {/* Image Inspection Component */}
      <ImageInspection image={image} />

      {/* Stats Grid */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
            Bottles
          </p>
          <p className="text-lg font-bold text-slate-700">{a.total_bottles}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
            PET Purity
          </p>
          <p
            className={`text-lg font-bold ${a.pet_purity_percent >= 80 ? "text-emerald-600" : "text-amber-600"}`}
          >
            {a.pet_purity_percent}%
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
            Total Weight
          </p>
          <div className="flex items-center gap-1">
            <Scale size={14} className="text-slate-400" />
            <p className="text-lg font-bold text-slate-700">
              {a.total_weight_kg}{" "}
              <span className="text-xs font-medium text-slate-400">kg</span>
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
            Contaminants
          </p>
          <p
            className={`text-lg font-bold ${a.non_pet_bottles > 0 ? "text-red-500" : "text-slate-700"}`}
          >
            {a.non_pet_bottles}
          </p>
        </div>
      </div>
    </div>
  );
}
