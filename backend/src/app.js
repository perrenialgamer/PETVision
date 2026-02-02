// src/app.js

import express from "express";
import cors from "cors";
import path from "path";
import batchRoutes from "./routes/batch.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 Serve uploaded images
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api/batch", batchRoutes);
app.use(errorHandler);

export default app;
