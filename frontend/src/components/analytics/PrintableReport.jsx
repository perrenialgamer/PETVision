import React from "react";
import { Recycle, CheckCircle, AlertTriangle } from "lucide-react";

export const PrintableReport = React.forwardRef(({ data, batchId }, ref) => {
  if (!data) {
    return <div ref={ref}></div>;
  }

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      ref={ref}
      className="p-8 max-w-[210mm] mx-auto bg-white text-slate-900"
    >
      {/* --- REPORT HEADER --- */}
      <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wide">
            Analysis Report
          </h1>
          <p className="text-emerald-700 font-semibold mt-1">
            Agglomeration 2.0 | Automated Polymer Segregation
          </p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg text-emerald-700 mb-2">
            <Recycle size={28} />
          </div>
          <p className="text-xs text-slate-500">Generated on</p>
          <p className="text-sm font-medium">{date}</p>
        </div>
      </div>

      {/* --- BATCH META --- */}
      <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
              Batch Identifier
            </p>
            <p className="font-mono text-lg text-slate-700">{batchId}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
              Quality Grade
            </p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">
                Grade {data.quality_grade}
              </span>
              {data.quality_grade === "A" ? (
                <CheckCircle className="text-emerald-500" size={20} />
              ) : (
                <AlertTriangle className="text-amber-500" size={20} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- KEY METRICS TABLE --- */}
      <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-emerald-500 pl-3">
        Composition Summary
      </h3>
      <table className="w-full text-sm text-left text-slate-600 mb-10 border-collapse">
        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
          <tr>
            <th className="px-4 py-3 rounded-tl-lg">Metric</th>
            <th className="px-4 py-3 rounded-tr-lg text-right">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <tr>
            <td className="px-4 py-3 font-medium">Total Bottles Processed</td>
            <td className="px-4 py-3 text-right font-bold">
              {data.total_bottles}
            </td>
          </tr>
          {/* ✅ NEW: Added Ratio Row */}
          <tr>
            <td className="px-4 py-3 font-medium">PET vs Non-PET Ratio</td>
            <td className="px-4 py-3 text-right font-bold font-mono">
              {data.pet_bottles} : {data.non_pet_bottles}
            </td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-medium">PET Purity Percentage</td>
            <td className="px-4 py-3 text-right font-bold text-emerald-600">
              {data.pet_purity_percent}%
            </td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-medium">Non-PET Contaminants</td>
            <td className="px-4 py-3 text-right text-red-600 font-bold">
              {data.non_pet_bottles}
            </td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-medium">Total Estimated Weight</td>
            <td className="px-4 py-3 text-right">{data.total_weight_kg} kg</td>
          </tr>
        </tbody>
      </table>

      {/* --- DETAILED BREAKDOWN --- */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">
            Brand Detected
          </h3>
          <ul className="space-y-2 text-sm">
            {Object.entries(data.brand_distribution || {}).map(
              ([brand, count]) => (
                <li key={brand} className="flex justify-between">
                  <span>{brand}</span>
                  <span className="font-mono text-slate-500">{count}</span>
                </li>
              ),
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">
            Color Classification
          </h3>
          <ul className="space-y-2 text-sm">
            {Object.entries(data.color_distribution || {}).map(
              ([color, count]) => (
                <li key={color} className="flex justify-between capitalize">
                  <span>{color.replace("_", " ")}</span>
                  <span className="font-mono text-slate-500">{count}</span>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </div>
  );
});

PrintableReport.displayName = "PrintableReport";
