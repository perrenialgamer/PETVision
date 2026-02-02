import { useState, useRef } from "react";
import BottleTooltip from "./BottleTooltip";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageInspection({ image }) {
  const [activeBottle, setActiveBottle] = useState(null);
  const imgRef = useRef(null);
  const [imgLayout, setImgLayout] = useState({
    clientWidth: 0,
    clientHeight: 0,
    naturalWidth: 0,
    naturalHeight: 0,
  });

  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl group select-none">
      {/* Dark overlay slightly reduces image brightness so boxes pop more */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />

      <img
        ref={imgRef}
        onLoad={() => {
          const el = imgRef.current;
          if (!el) return;
          setImgLayout({
            clientWidth: el.clientWidth,
            clientHeight: el.clientHeight,
            naturalWidth: el.naturalWidth,
            naturalHeight: el.naturalHeight,
          });
        }}
        src={`http://localhost:5000${image.image_url}?t=${encodeURIComponent(
          image.timestamp || Date.now(),
        )}`}
        alt={image.image_id}
        className="w-full h-auto block opacity-90"
      />

      {image.bottles.map((b) => {
        const { x, y, w, h } = b.bbox_norm;
        const cw = imgLayout.clientWidth || 0;
        const ch = imgLayout.clientHeight || 0;

        const leftPx = cw ? x * cw : 0;
        const topPx = ch ? y * ch : 0;
        const widthPx = cw ? w * cw : 0;
        const heightPx = ch ? h * ch : 0;

        const isActive = activeBottle?.bottle_id === b.bottle_id;

        // Colors: Emerald (PET) vs Rose (Non-PET)
        const baseColor = b.is_pet ? "#10b981" : "#f43f5e";

        return (
          <motion.div
            key={b.bottle_id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute z-20 cursor-crosshair"
            style={{
              left: `${leftPx}px`,
              top: `${topPx}px`,
              width: `${widthPx}px`,
              height: `${heightPx}px`,
            }}
            onMouseMove={(e) =>
              setActiveBottle({
                ...b,
                cursorX: e.clientX,
                cursorY: e.clientY,
              })
            }
            onMouseLeave={() => setActiveBottle(null)}
          >
            {/* --- UI STYLE: FULL VISIBILITY BOX --- */}
            <div
              className="w-full h-full transition-all duration-150"
              style={{
                // Thicker 3px border
                border: `3px solid ${baseColor}`,
                // Strong outer glow + inner glow for maximum contrast
                boxShadow: isActive
                  ? `0 0 20px ${baseColor}, inset 0 0 10px ${baseColor}40`
                  : `0 0 5px ${baseColor}`,
                // Tint the inside on hover
                backgroundColor: isActive ? `${baseColor}20` : "transparent",
              }}
            >
              {/* Always visible label for quick scanning */}
              {isActive && (
                <div
                  className="absolute -top-7 left-0 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm rounded-sm whitespace-nowrap z-30"
                  style={{ backgroundColor: baseColor }}
                >
                  {b.is_pet ? "PET" : "NON PET"} •{" "}
                  {(b.pet_confidence * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      <AnimatePresence>
        {activeBottle && <BottleTooltip bottle={activeBottle} />}
      </AnimatePresence>
    </div>
  );
}
