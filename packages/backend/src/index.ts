import "dotenv/config";
import express, { type Express } from "express";
import cors from "cors";
import { repoRoutes } from "./routes/repos.js";
import { analysisRoutes } from "./routes/analysis.js";
import { qaRoutes } from "./routes/qa.js";
import { internalRoutes } from "./routes/internal.js";
import { walkthroughRoutes } from "./routes/walkthroughs.js";
import { conventionRoutes } from "./routes/conventions.js";
import { envSetupRoutes } from "./routes/envSetup.js";

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" })); // Large payloads for code files

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "autodev-backend" });
});

// API routes
app.use("/api/repos", repoRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/qa", qaRoutes);
app.use("/api/internal", internalRoutes);
app.use("/api/walkthroughs", walkthroughRoutes);
app.use("/api/conventions", conventionRoutes);
app.use("/api/env-setup", envSetupRoutes);

app.listen(PORT, () => {
  console.log(`AutoDev backend running on http://localhost:${PORT}`);
});

export default app;
