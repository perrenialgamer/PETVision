import React from "react";
import { createPortal } from "react-dom";

export default function BottleTooltip({ bottle }) {
  if (!bottle) return null;

  // Smart positioning to keep tooltip visible on screen
  let left = bottle.cursorX + 10; // Half of w-64 (256px)
  let top = bottle.cursorY - 220; // Slightly higher offset

  // Keep tooltip within viewport bounds
  if (left < 10) left = 10;
  if (left + 260 > window.innerWidth) left = window.innerWidth - 270;
  if (top < 10) top = 10;

  const tooltipElement = (
    <div
      // Pointer-events-none ensures mouse doesn't get stuck on tooltip
      className="fixed w-64 rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur-xl p-3 text-xs text-white shadow-2xl shadow-black/50 pointer-events-none"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 9999,
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
        <span className="font-mono font-bold text-slate-300">
          ID: {bottle.bottle_id}
        </span>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            bottle.is_pet
              ? "bg-emerald-500 text-white"
              : "bg-rose-500 text-white"
          }`}
        >
          {bottle.is_pet ? "PET" : "NON PET"}
        </span>
      </div>

      {/* Grid Data */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-3">
        <div>
          <p className="text-[10px] uppercase text-slate-500 font-semibold">
            Confidence
          </p>
          <p className="font-mono text-emerald-400 font-bold">
            {(bottle.pet_confidence * 100).toFixed(1)}%
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase text-slate-500 font-semibold">
            PET Prob.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${bottle.pet_probability > 0.5 ? "bg-emerald-500" : "bg-amber-500"}`}
                style={{ width: `${bottle.pet_probability * 100}%` }}
              />
            </div>
            <span className="font-mono text-[10px] font-bold">
              {(bottle.pet_probability * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase text-slate-500 font-semibold">
            Size / Wt.
          </p>
          <p className="font-medium text-slate-200">
            {bottle.size_class} <span className="text-slate-500">/</span>{" "}
            {bottle.estimated_weight_g}g
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase text-slate-500 font-semibold">
            Brand
          </p>
          <p className="font-medium text-slate-200 capitalize truncate max-w-[80px]">
            {bottle.brand}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase text-slate-500 font-semibold">
            Color
          </p>
          <p className="font-medium text-slate-200 capitalize">
            {bottle.color || "Unknown"}
          </p>
        </div>
      </div>

      {/* Color Description - Full Width */}
      {bottle.color_description && bottle.color_description !== "Unknown" && (
        <div className="mt-3 rounded bg-slate-800/50 p-2 border border-slate-700/50">
          <div className="flex items-start gap-2">
            <span className="text-blue-400 text-[10px]">ℹ️</span>
            <p className="text-[10px] text-blue-200 leading-tight italic">
              {bottle.color_description}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Render tooltip using portal to break out of stacking context
  return createPortal(tooltipElement, document.body);
}
