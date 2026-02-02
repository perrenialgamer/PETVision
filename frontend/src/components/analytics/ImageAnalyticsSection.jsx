import ImageAnalyticsCard from "./ImageAnalyticsCard";

export default function ImageAnalyticsSection({ images }) {
  return (
    <section className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-slate-900">Image Inspection</h2>
        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-xs font-bold text-slate-600">
          {images.length}
        </span>
      </div>

      {/* Masonry Layout using CSS Columns */}
      <div className="columns-1 md:columns-2 gap-6 space-y-6">
        {images.map((img) => (
          <div key={img.image_id} className="break-inside-avoid mb-6">
            <ImageAnalyticsCard image={img} />
          </div>
        ))}
      </div>
    </section>
  );
}
