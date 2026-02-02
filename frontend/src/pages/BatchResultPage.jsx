import { useRef } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Printer, Download } from "lucide-react";

import PageWrapper from "../components/layout/PageWrapper";
import SummaryCards from "../components/analytics/SummaryCards";
import ColorChart from "../components/analytics/ColorChart";
import BrandChart from "../components/analytics/BrandChart";
import SizeChart from "../components/analytics/SizeChart";
import ImageAnalyticsSection from "../components/analytics/ImageAnalyticsSection";
import { PrintableReport } from "../components/analytics/PrintableReport";
import { useEffect } from "react";

export default function BatchResultPage() {
  const { state } = useLocation();
  const componentRef = useRef(null);

  if (!state) return <Navigate to="/" />;

  const { batch_analytics } = state;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Agglomeration_Report_${state.batch_id}`,
  });

  const handleSaveCSV = () => {
    if (!state.images) return;
    const headers = [
      "Image ID",
      "Bottle ID",
      "Is PET?",
      "Confidence",
      "Color",
      "Brand",
      "Size",
      "Est. Weight (g)",
    ];
    const rows = state.images.flatMap((img) =>
      img.bottles.map((b) => [
        img.image_id,
        b.bottle_id,
        b.is_pet ? "Yes" : "No",
        (b.pet_confidence * 100).toFixed(1) + "%",
        b.color || "Unknown",
        b.brand || "Unknown",
        b.size_class || "Unknown",
        b.estimated_weight_g || 0,
      ]),
    );
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Batch_Report_${state.batch_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageWrapper>
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Analysis Results
          </h1>
          <p className="text-slate-500 mt-1">
            Batch ID:{" "}
            <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              {state.batch_id}
            </span>
          </p>
        </div>

        <div className="flex gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer size={16} />
            Export PDF
          </button>
          <button
            onClick={handleSaveCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
          >
            <Download size={16} />
            Save Report
          </button>
        </div>
      </div>

      <SummaryCards analytics={batch_analytics} />

      {/* --- CHARTS GRID LAYOUT (FIXED) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 break-inside-avoid">
        {/* Row 1: Size Chart (Full Width) */}
        <div className="md:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full" />
            Size Distribution
          </h3>
          <SizeChart data={batch_analytics.size_distribution} />
        </div>

        {/* Row 2: Brand & Color (Side by Side) */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-purple-500 rounded-full" />
            Brand Market Share
          </h3>
          <BrandChart data={batch_analytics.brand_distribution} />
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full" />
            Color Segregation
          </h3>
          <ColorChart data={batch_analytics.color_distribution} />
        </div>
      </div>

      <div className="mt-10">
        <ImageAnalyticsSection images={state.images} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 0,
          width: 0,
          overflow: "hidden",
        }}
      >
        <PrintableReport
          ref={componentRef}
          data={state.batch_analytics}
          batchId={state.batch_id}
        />
      </div>
    </PageWrapper>
  );
}
