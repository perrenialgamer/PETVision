import fs from "fs/promises";
import sharp from "sharp";
import { runPetModel } from "../services/ai.service.js";
import { computeImageAnalytics } from "../utils/imageAnalytics.util.js";
import { computeBatchAnalytics } from "../utils/batchAnalytics.util.js";
import { successResponse } from "../utils/response.util.js";

export const processBatch = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new Error("No images uploaded");
    }

    const images = await Promise.all(
      req.files.map(async (file, index) => {
        // 1. Get ACTUAL image dimensions (Crucial for BBox normalization)
        const imageBuffer = await fs.readFile(file.path);
        const rotatedBuffer = await sharp(imageBuffer).rotate().toBuffer();
        const metadata = await sharp(rotatedBuffer).metadata();
        const imgWidth = metadata.width;
        const imgHeight = metadata.height;

        // Overwrite original file with correctly oriented one
        await fs.writeFile(file.path, rotatedBuffer);

        // 2. Run the AI Model
        const aiOutput = await runPetModel(file.path);
        const detectedObjects = aiOutput.objects || [];

        // 3. Map Python Data to Backend Schema
        const bottles = detectedObjects.map((obj, i) => {
          return {
            bottle_id: i + 1,
            bbox: obj.bbox, // [x1, y1, x2, y2]

            // --- Material Stats ---
            // Check if material is "PET"
            is_pet: obj.material === "PET",
            material_type: obj.material,

            // --- Confidence Stats ---
            // Material classification confidence (0-1 range from Python)
            pet_confidence: obj.detection_confidence || 0,
            // True PET probability: high if material is PET, else low
            pet_probability: obj.pet_probability || 0,

            // --- Attributes ---
            // Color category from Python
            color: obj.color_category || "Unknown",
            color_description: (() => {
              const colorMap = {
                Clear: "High Value PET",
                Green: "Soft Drink Bottle",
                Blue: "Water/Cooler Bottle",
                Brown: "Beer/Pharmaceutical",
                "Mixed/Opaque": "Non-transparent Material",
                "Mixed/Other": "Mixed Material Type",
              };
              return colorMap[obj.color_category] || "Unknown";
            })(),

            // Size class from Python
            size_class: obj.size_category || "Unknown",

            // Brand name and confidence (convert to percentage)
            brand: obj.brand || "Unknown",
            brand_confidence: Math.round((obj.brand_conf || 0) * 100),

            // --- Weight Parsing ---
            // Handles "10-15g" format and returns average in grams
            estimated_weight_g: (() => {
              if (!obj.estimated_weight) return 0;
              if (typeof obj.estimated_weight === "string") {
                const match = obj.estimated_weight.match(/(\d+)-?(\d+)?/);
                if (match) {
                  const first = parseFloat(match[1]);
                  const second = match[2] ? parseFloat(match[2]) : first;
                  return Math.round((first + second) / 2);
                }
                return 0;
              }
              return parseFloat(obj.estimated_weight) || 0;
            })(),
          };
        });

        // 4. Normalize Bounding Boxes
        const bottlesWithNormalizedBBox = bottles.map((b) => {
          const [x1, y1, x2, y2] = b.bbox || [0, 0, 0, 0];
          return {
            ...b,
            bbox_norm: {
              x: x1 / imgWidth,
              y: y1 / imgHeight,
              w: (x2 - x1) / imgWidth,
              h: (y2 - y1) / imgHeight,
            },
          };
        });

        // 5. Return Processed Image Object
        return {
          image_id: `img_${index + 1}`,
          image_url: `/uploads/${file.filename}`,
          timestamp: new Date().toISOString(),
          image_analytics: computeImageAnalytics(bottlesWithNormalizedBBox),
          bottles: bottlesWithNormalizedBBox,
          meta: { width: imgWidth, height: imgHeight },
        };
      }),
    );

    // 6. Aggregate Total Batch Analytics
    const batchAnalytics = computeBatchAnalytics(images);

    // 7. Send Final Response
    res.json(
      successResponse({
        batch_id: `batch_${Date.now()}`,
        total_images: images.length,
        batch_analytics: batchAnalytics,
        images,
      }),
    );
  } catch (err) {
    next(err);
  }
};
