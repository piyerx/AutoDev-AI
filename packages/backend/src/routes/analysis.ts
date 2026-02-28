import { Router, type Router as RouterType } from "express";

export const analysisRoutes: RouterType = Router();

// GET /api/analysis/:owner/:repo/architecture — get architecture map
analysisRoutes.get("/:owner/:repo/architecture", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  // TODO: fetch from DynamoDB/S3
  res.json({ repoId, architecture: null });
});

// GET /api/analysis/:owner/:repo/conventions — get detected conventions
analysisRoutes.get("/:owner/:repo/conventions", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  // TODO: fetch from DynamoDB
  res.json({ repoId, conventions: [] });
});

// GET /api/analysis/:owner/:repo/walkthroughs — get walkthroughs
analysisRoutes.get("/:owner/:repo/walkthroughs", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  // TODO: fetch from DynamoDB
  res.json({ repoId, walkthroughs: [] });
});
