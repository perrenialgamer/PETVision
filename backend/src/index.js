import app from "./app.js";
import { SERVER_CONFIG } from "./config/server.config.js";

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(SERVER_CONFIG.PORT, () => {
  console.log(`🚀 Backend running on port ${SERVER_CONFIG.PORT}`);
});
