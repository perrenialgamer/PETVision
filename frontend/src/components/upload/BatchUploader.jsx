import { useState, useCallback, useRef, useEffect } from "react";
import { analyzeBatch } from "../../api/batchApi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileImage,
  X,
  Loader2,
  ScanLine,
  ArrowRight,
  Camera,
  CheckCircle2, // ✅ NEW ICON
} from "lucide-react";
import clsx from "clsx";

export default function BatchUploader() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // --- CAMERA STATE ---
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [flash, setFlash] = useState(false); // 📸 Controls the white screen flash
  const [showCaptureSuccess, setShowCaptureSuccess] = useState(false); // ✅ Controls "Captured!" text

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // --- CAMERA FUNCTIONS ---

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // 1. Trigger Flash Effect
    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        // 2. Add file to queue
        addFiles([file]);

        // 3. Trigger "Captured!" Success Message
        setShowCaptureSuccess(true);
        setTimeout(() => setShowCaptureSuccess(false), 1500);
      },
      "image/jpeg",
      0.9,
    );
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // --- STANDARD UPLOAD FUNCTIONS ---

  const addFiles = (newFiles) => {
    const filesWithId = newFiles.map((file) => ({
      file,
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).substr(2, 9)}`,
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...filesWithId]);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
      e.target.value = "";
    }
  };

  const removeFile = (idToRemove) => {
    setFiles((prev) => prev.filter((f) => f.id !== idToRemove));
  };

  const clearAllFiles = () => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f.file));
    setLoading(true);
    try {
      const res = await analyzeBatch(fd);
      navigate("/result", { state: res.data.data });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center mb-8 space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 text-emerald-700 text-xs font-semibold uppercase tracking-wider border border-emerald-200"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          System Online
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
          Batch Analysis{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            Center
          </span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Upload conveyor belt imagery to detect, segregate, and analyze polymer
          composition using next-gen Computer Vision.
        </p>
      </div>

      <div className="w-full max-w-3xl">
        <div className="relative overflow-hidden rounded-[2rem]">
          <AnimatePresence mode="wait">
            {isCameraOpen ? (
              <motion.div
                key="camera"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative bg-black aspect-video rounded-[2rem] overflow-hidden border-4 border-emerald-500 shadow-2xl group"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* --- 📸 FLASH EFFECT --- */}
                <div
                  className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-150 ${flash ? "opacity-100" : "opacity-0"}`}
                  style={{ zIndex: 50 }}
                />

                {/* --- ✅ CAPTURE FEEDBACK OVERLAY --- */}
                <AnimatePresence>
                  {showCaptureSuccess && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center z-40 bg-black/20 backdrop-blur-sm"
                    >
                      <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl">
                        <CheckCircle2 size={32} strokeWidth={3} />
                        <span className="text-xl font-bold tracking-wide">
                          CAPTURED!
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Camera Controls */}
                <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-8 z-30">
                  <button
                    onClick={stopCamera}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors border border-white/10"
                    title="Close Camera"
                  >
                    <X size={24} />
                  </button>
                  {/* SHUTTER BUTTON */}
                  <button
                    onClick={capturePhoto}
                    className="group/shutter relative p-1 rounded-full hover:scale-105 active:scale-95 transition-transform"
                  >
                    {/* Ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-white/30 group-hover/shutter:border-white/50 transition-colors" />
                    {/* Inner Circle */}
                    <div className="w-16 h-16 bg-white rounded-full shadow-lg m-1 group-active/shutter:bg-emerald-500 transition-colors" />
                  </button>
                  <div className="w-12 h-12" /> {/* Spacer */}
                </div>

                {/* Live Indicator */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-red-500/80 backdrop-blur text-white text-xs font-bold rounded-full flex items-center gap-2 animate-pulse shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  LIVE FEED
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={clsx(
                  "relative group border-4 border-dashed transition-all duration-500 ease-out overflow-hidden rounded-[2rem]",
                  isDragging
                    ? "border-emerald-500 bg-emerald-50/30 scale-[1.02] shadow-2xl shadow-emerald-500/20"
                    : "border-slate-200 bg-white/40 hover:border-emerald-300 hover:bg-white/60",
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  id="file-upload"
                  onChange={handleFileSelect}
                />

                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center py-20 px-4 cursor-pointer"
                >
                  <div
                    className={clsx(
                      "w-24 h-24 rounded-3xl flex items-center justify-center mb-6 transition-all duration-500",
                      isDragging
                        ? "bg-emerald-500 text-white rotate-12 scale-110 shadow-xl"
                        : "bg-white text-slate-300 shadow-lg group-hover:text-emerald-500 group-hover:scale-110",
                    )}
                  >
                    <UploadCloud size={48} strokeWidth={1.5} />
                  </div>
                  <p className="text-2xl font-bold text-slate-700">
                    Drag images here or{" "}
                    <span className="text-emerald-600 underline decoration-2 decoration-emerald-200 underline-offset-4 group-hover:decoration-emerald-500 transition-all">
                      browse
                    </span>
                  </p>

                  {/* BUTTON GROUP */}
                  <div className="flex items-center gap-4 mt-8 relative z-20">
                    <span className="text-sm font-bold text-slate-300">OR</span>
                    <button
                      type="button" // Prevent label trigger
                      onClick={(e) => {
                        e.preventDefault(); // Stop file dialog from opening
                        startCamera();
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <Camera size={18} />
                      Open Camera
                    </button>
                  </div>
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* File Preview List */}
        <AnimatePresence mode="popLayout">
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between text-sm text-slate-500 px-2 mb-4">
                <span className="font-semibold text-slate-700">
                  {files.length} Files Ready
                </span>
                <button
                  onClick={clearAllFiles}
                  className="text-xs font-medium hover:text-red-500 transition-colors uppercase tracking-wider"
                >
                  Clear Queue
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {files.map((fileObj) => (
                  <motion.div
                    key={fileObj.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
                  >
                    {fileObj.file.type.startsWith("image/") ? (
                      <img
                        src={fileObj.preview}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <FileImage size={32} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all shadow-sm"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200/60">
                <button
                  onClick={submit}
                  disabled={!files.length || loading}
                  className="w-full btn-primary h-16 rounded-xl text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      <span className="animate-pulse">
                        Processing Batch Data...
                      </span>
                    </>
                  ) : (
                    <>
                      <ScanLine className="group-hover:scale-110 transition-transform" />
                      <span>Initiate Analysis</span>
                      <ArrowRight className="opacity-60 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
