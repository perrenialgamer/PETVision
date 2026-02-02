import fs from "fs";
import axios from "axios";
import FormData from "form-data";

// Allow overriding the ML service URL via environment (required for Docker).
// Default remains localhost to preserve local dev behaviour.
const ML_API_URL = process.env.ML_API_URL || "http://127.0.0.1:8000";

export const runPetModel = async (imagePath) => {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(imagePath));

    // 1. Get Real Data from Python
    const response = await axios.post(`${ML_API_URL}/predict`, form, {
      headers: { ...form.getHeaders() },
    });

    const mlData = response.data;

    // 2. Transform Python field names to match backend expectations
    if (mlData.objects && mlData.objects.length > 0) {
      mlData.objects = mlData.objects.map((obj) => ({
        bbox: obj.bbox,
        material: obj.material,
        detection_confidence: obj.material_conf || 0, // Material confidence
        pet_probability: obj.material_conf || 0, // Reuse material_conf as PET probability
        color_category: obj.color || "Unknown",
        color_description: obj.color || "Unknown",
        size_category: obj.size || "Unknown",
        estimated_weight: obj.weight_est || "0",
        brand: obj.brand || "Unknown",
        brand_conf: obj.brand_conf || 0, // Brand confidence
      }));
    }

    return mlData;
  } catch (error) {
    console.error("AI Service Error:", error.message);
    return { status: "error", total_bottles_detected: 0, objects: [] };
  }
};

export const runColorSizeModel = async () => [];
export const runBrandWeightModel = async () => [];
