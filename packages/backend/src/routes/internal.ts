/**
 * Internal routes — called by the GitHub App (not user-facing).
 */
import { Router, type Router as RouterType } from "express";
import { uploadCodeIndexWithLatest } from "../services/s3.js";
import { putRepo } from "../services/dynamodb.js";
import { runArchitectureAnalysis } from "../services/analysisOrchestrator.js";

export const internalRoutes: RouterType = Router();

/**
 * POST /api/internal/ingest
 * Receives fetched repo files from the GitHub App, stores in S3, triggers analysis.
 */
internalRoutes.post("/ingest", async (req, res) => {
  const { repoId, installationId, commitSha, defaultBranch, files } = req.body as {
    repoId: string;
    installationId?: number;
    commitSha?: string;
    defaultBranch?: string;
    files: { path: string; content: string; size: number }[];
  };

  if (!repoId || !files || !Array.isArray(files)) {
    res.status(400).json({ error: "repoId and files are required" });
    return;
  }

  try {
    const sha = commitSha || "latest";

    // Store code index in S3
    await uploadCodeIndexWithLatest(repoId, sha, files);
    console.log(`[ingest] Uploaded ${files.length} files to S3 for ${repoId}`);

    // Upsert repo in DynamoDB
    const [owner] = repoId.split("/");
    await putRepo({
      repoId,
      userId: owner, // default to owner; real auth would set actual user
      repoUrl: `https://github.com/${repoId}`,
      defaultBranch: defaultBranch || "main",
      analysisStatus: "pending",
      fileCount: files.length,
      installationId,
      createdAt: new Date().toISOString(),
    });

    // Respond immediately and run analysis in background
    res.json({ repoId, status: "ingested", fileCount: files.length });

    // Trigger analysis asynchronously
    runArchitectureAnalysis({ repoId, files }).catch((err) =>
      console.error(`[ingest] Background analysis failed for ${repoId}:`, err)
    );
  } catch (error) {
    console.error(`[ingest] Failed for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to ingest repository" });
  }
});
