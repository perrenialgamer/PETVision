import express from "express";
import multer from "multer";
import { processBatch } from "../controllers/batch.controller.js";
import { SERVER_CONFIG } from "../config/server.config.js";

const router = express.Router();

const upload = multer({
  dest: SERVER_CONFIG.UPLOAD_DIR,
  limits: { fileSize: SERVER_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024 },
});

// multiple images per batch
router.post("/analyze", upload.array("images", 20), processBatch);

export default router;
