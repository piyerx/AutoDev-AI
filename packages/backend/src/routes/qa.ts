import { Router, type Router as RouterType } from "express";
import { createHash } from "crypto";
import { answerQuestion } from "../services/bedrock.js";
import { cacheQA, getCachedQA } from "../services/dynamodb.js";
import { getArchitectureAnalysis } from "../services/analysisOrchestrator.js";
import { getLatestCodeIndex } from "../services/s3.js";

export const qaRoutes: RouterType = Router();

// POST /api/qa/:owner/:repo — ask a question about the codebase
qaRoutes.post("/:owner/:repo", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const { question } = req.body as { question: string };

  if (!question) {
    res.status(400).json({ error: "question is required" });
    return;
  }

  try {
    // Check cache first
    const questionHash = createHash("sha256").update(question.toLowerCase().trim()).digest("hex").slice(0, 16);
    const cached = await getCachedQA(repoId, questionHash);
    if (cached) {
      res.json({ repoId, question, ...cached, fromCache: true });
      return;
    }

    // Get architecture context
    const architecture = await getArchitectureAnalysis(repoId);
    const architectureContext = architecture
      ? JSON.stringify(architecture, null, 2)
      : "No architecture analysis available yet.";

    // Get relevant source files (simple approach: send top files)
    const files = await getLatestCodeIndex(repoId);
    const relevantFiles = files
      ? files
          .slice(0, 20)
          .map((f) => `--- ${f.path} ---\n${f.content.slice(0, 3000)}`)
          .join("\n\n")
      : "No source files available.";

    // Call Bedrock
    const rawAnswer = await answerQuestion(question, architectureContext, relevantFiles);

    // Parse response
    let parsed;
    try {
      let cleaned = rawAnswer.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
      }
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { answer: rawAnswer, relevantFiles: [], relatedQuestions: [] };
    }

    // Cache the result
    await cacheQA(repoId, questionHash, parsed).catch(() => {
      // Swallow cache errors
    });

    res.json({ repoId, question, ...parsed });
  } catch (error) {
    console.error(`[route] Q&A failed for ${repoId}:`, error);
    res.status(500).json({
      error: "Failed to answer question",
      repoId,
      question,
    });
  }
});
