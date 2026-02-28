import { Router, type Router as RouterType } from "express";

export const repoRoutes: RouterType = Router();

// GET /api/repos — list connected repos for the user
repoRoutes.get("/", async (_req, res) => {
  // TODO: fetch from DynamoDB by userId
  res.json({ repos: [] });
});

// GET /api/repos/:repoId — get repo details
repoRoutes.get("/:owner/:repo", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  // TODO: fetch from DynamoDB
  res.json({ repoId, status: "not_found" });
});

// POST /api/repos/:repoId/analyze — trigger analysis
repoRoutes.post("/:owner/:repo/analyze", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  // TODO: trigger analysis pipeline
  res.json({ repoId, status: "analysis_queued" });
});
