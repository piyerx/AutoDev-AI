import { Router, type Router as RouterType } from "express";

export const qaRoutes: RouterType = Router();

// POST /api/qa/:owner/:repo — ask a question about the codebase
qaRoutes.post("/:owner/:repo", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const { question } = req.body as { question: string };

  if (!question) {
    res.status(400).json({ error: "question is required" });
    return;
  }

  // TODO: semantic search + Bedrock call
  res.json({
    repoId,
    question,
    answer: "Q&A endpoint coming soon — Bedrock integration pending",
    relevantFiles: [],
  });
});
