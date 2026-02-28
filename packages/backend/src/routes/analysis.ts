import { Router, type Router as RouterType } from "express";
import {
  getArchitectureAnalysis,
  runArchitectureAnalysis,
} from "../services/analysisOrchestrator.js";
import { getAnalysis } from "../services/dynamodb.js";

export const analysisRoutes: RouterType = Router();

// GET /api/analysis/:owner/:repo/architecture — get architecture map
analysisRoutes.get("/:owner/:repo/architecture", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  try {
    const architecture = await getArchitectureAnalysis(repoId);
    res.json({ repoId, architecture });
  } catch (error) {
    console.error(`[route] Failed to get architecture for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to fetch architecture analysis" });
  }
});

// POST /api/analysis/:owner/:repo/architecture — trigger architecture analysis
analysisRoutes.post("/:owner/:repo/architecture", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  try {
    // Fire-and-forget: respond immediately, run analysis in background
    res.json({ repoId, status: "analysis_started" });

    runArchitectureAnalysis({ repoId }).catch((err) =>
      console.error(`[route] Background analysis failed for ${repoId}:`, err)
    );
  } catch (error) {
    console.error(`[route] Failed to start analysis for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to start analysis" });
  }
});

// GET /api/analysis/:owner/:repo/conventions — get detected conventions
analysisRoutes.get("/:owner/:repo/conventions", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  try {
    const record = await getAnalysis(repoId, "conventions");
    const conventions = record?.content || [];
    res.json({ repoId, conventions });
  } catch (error) {
    console.error(`[route] Failed to get conventions for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to fetch conventions" });
  }
});

// GET /api/analysis/:owner/:repo/walkthroughs — get walkthroughs
analysisRoutes.get("/:owner/:repo/walkthroughs", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  try {
    const record = await getAnalysis(repoId, "walkthrough");
    const walkthroughs = record?.content ? [record.content] : [];
    res.json({ repoId, walkthroughs });
  } catch (error) {
    console.error(`[route] Failed to get walkthroughs for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to fetch walkthroughs" });
  }
});
