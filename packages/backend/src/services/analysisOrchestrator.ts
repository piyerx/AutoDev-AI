/**
 * Analysis orchestrator — coordinates the full pipeline:
 * 1. Fetch code from S3 (or receive files directly)
 * 2. Run two-pass Bedrock architecture analysis
 * 3. Store results in DynamoDB + S3
 */

import type { ArchitectureMap, AnalysisResult } from "@autodev/shared";
import { analyzeArchitecture } from "./bedrock.js";
import { uploadAnalysisOutput, getLatestCodeIndex } from "./s3.js";
import {
  putAnalysis,
  getAnalysis,
  updateRepoStatus,
  getRepoById,
} from "./dynamodb.js";

export interface AnalysisInput {
  repoId: string; // "owner/repo"
  files?: { path: string; content: string; size: number }[];
}

/**
 * Run the full architecture analysis pipeline.
 * If files are not provided directly, fetches them from S3 (latest index).
 */
export async function runArchitectureAnalysis(
  input: AnalysisInput
): Promise<AnalysisResult> {
  const { repoId } = input;

  // Look up the repo to get the userId for status updates
  const repo = await getRepoById(repoId);
  const userId = (repo?.userId as string) || "system";

  try {
    // Mark as analyzing
    await updateRepoStatus(repoId, userId, "analyzing");

    // Get files — either provided directly or fetch from S3
    let files = input.files;
    if (!files) {
      const stored = await getLatestCodeIndex(repoId);
      if (!stored) {
        throw new Error(`No code index found in S3 for ${repoId}`);
      }
      files = stored;
    }

    console.log(
      `[analysis] Starting architecture analysis for ${repoId} (${files.length} files)`
    );

    // Run two-pass Bedrock analysis
    const architecture: ArchitectureMap = await analyzeArchitecture(files);

    console.log(
      `[analysis] Architecture analysis complete for ${repoId}: ${architecture.nodes.length} nodes, ${architecture.edges.length} edges`
    );

    // Build the analysis result
    const analysisResult: AnalysisResult = {
      repoId,
      analysisType: "architecture",
      version: 1,
      content: architecture,
      generatedAt: new Date().toISOString(),
      modelUsed: "anthropic.claude-3-5-sonnet-20241022-v2:0",
    };

    // Store in DynamoDB
    await putAnalysis({
      ...analysisResult,
      analysisType: `architecture#${analysisResult.generatedAt}`,
    });

    // Store in S3 (for fast frontend retrieval)
    await uploadAnalysisOutput(repoId, "architecture", architecture);

    // Update repo status
    await updateRepoStatus(repoId, userId, "completed", {
      techStack: architecture.techStack,
      fileCount: files.length,
    });

    return analysisResult;
  } catch (error) {
    console.error(`[analysis] Failed for ${repoId}:`, error);

    // Mark as failed
    try {
      await updateRepoStatus(repoId, userId, "failed");
    } catch {
      // Swallow DynamoDB errors during error handling
    }

    throw error;
  }
}

/**
 * Get the latest architecture analysis for a repo.
 * Tries S3 first (fast), falls back to DynamoDB.
 */
export async function getArchitectureAnalysis(
  repoId: string
): Promise<ArchitectureMap | null> {
  // Try S3 first (fast read)
  try {
    const { getAnalysisOutput } = await import("./s3.js");
    const fromS3 = await getAnalysisOutput<ArchitectureMap>(
      repoId,
      "architecture"
    );
    if (fromS3) return fromS3;
  } catch {
    // Fall through to DynamoDB
  }

  // Fall back to DynamoDB
  const record = await getAnalysis(repoId, "architecture");
  if (record?.content) {
    return record.content as ArchitectureMap;
  }

  return null;
}
