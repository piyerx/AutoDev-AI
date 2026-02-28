/**
 * Analysis orchestrator — coordinates the full pipeline:
 * 1. Fetch code from S3 (or receive files directly)
 * 2. Run two-pass Bedrock architecture analysis
 * 3. Run convention detection, walkthrough generation, env-setup analysis
 * 4. Store results in DynamoDB + S3
 */

import type {
  ArchitectureMap,
  AnalysisResult,
  Convention,
  Walkthrough,
  EnvSetupGuide,
} from "@autodev/shared";
import { analyzeArchitecture, invokeBedrock } from "./bedrock.js";
import {
  uploadAnalysisOutput,
  getLatestCodeIndex,
  getAnalysisOutput,
} from "./s3.js";
import {
  putAnalysis,
  getAnalysis,
  updateRepoStatus,
  getRepoById,
} from "./dynamodb.js";
import {
  CONVENTIONS_SYSTEM_PROMPT,
  CONVENTIONS_USER_PROMPT,
} from "../prompts/conventions.js";
import {
  AUTO_WALKTHROUGH_SYSTEM_PROMPT,
  AUTO_WALKTHROUGH_USER_PROMPT,
} from "../prompts/walkthrough.js";
import { buildKeyFileContents } from "../prompts/architecture.js";
import { analyzeEnvironmentSetup } from "./envAnalyzer.js";

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

    // Fire-and-forget: cascade into convention, walkthrough, and env-setup analysis
    const cascadeInput = { repoId, files };
    Promise.allSettled([
      runConventionAnalysis(cascadeInput).catch((err) =>
        console.error(`[cascade] Convention analysis failed for ${repoId}:`, err)
      ),
      runWalkthroughGeneration(cascadeInput).catch((err) =>
        console.error(`[cascade] Walkthrough generation failed for ${repoId}:`, err)
      ),
      runEnvSetupAnalysis(cascadeInput).catch((err) =>
        console.error(`[cascade] Env setup analysis failed for ${repoId}:`, err)
      ),
    ]).then(() =>
      console.log(`[cascade] All secondary analyses complete for ${repoId}`)
    );

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

// ─── Convention Analysis ──────────────────────────────────────────────────────

/**
 * Detect coding conventions from the codebase.
 */
export async function runConventionAnalysis(
  input: AnalysisInput
): Promise<Convention[]> {
  const { repoId } = input;
  let files = input.files;
  if (!files) {
    const stored = await getLatestCodeIndex(repoId);
    if (!stored) throw new Error(`No code index for ${repoId}`);
    files = stored;
  }

  console.log(`[conventions] Starting convention detection for ${repoId}`);

  const architecture = await getArchitectureAnalysis(repoId);
  const archCtx = architecture
    ? JSON.stringify(architecture, null, 2)
    : "No architecture analysis available.";
  const keyContents = buildKeyFileContents(files);

  const raw = await invokeBedrock(
    [{ role: "user", content: CONVENTIONS_USER_PROMPT(archCtx, keyContents) }],
    CONVENTIONS_SYSTEM_PROMPT,
    { model: "sonnet", maxTokens: 8192 }
  );

  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "");
  }
  const conventions = JSON.parse(cleaned) as Convention[];

  await putAnalysis({
    repoId,
    analysisType: `conventions#${new Date().toISOString()}`,
    version: 1,
    content: conventions,
    generatedAt: new Date().toISOString(),
    modelUsed: "anthropic.claude-3-5-sonnet-20241022-v2:0",
  });
  await uploadAnalysisOutput(repoId, "conventions", conventions);

  console.log(
    `[conventions] Detected ${conventions.length} conventions for ${repoId}`
  );
  return conventions;
}

// ─── Walkthrough Generation ───────────────────────────────────────────────────

/**
 * Auto-generate 3-5 pre-built walkthroughs for the most important parts of the codebase.
 */
export async function runWalkthroughGeneration(
  input: AnalysisInput
): Promise<Walkthrough[]> {
  const { repoId } = input;
  let files = input.files;
  if (!files) {
    const stored = await getLatestCodeIndex(repoId);
    if (!stored) throw new Error(`No code index for ${repoId}`);
    files = stored;
  }

  console.log(`[walkthroughs] Generating walkthroughs for ${repoId}`);

  const architecture = await getArchitectureAnalysis(repoId);
  const archCtx = architecture
    ? JSON.stringify(architecture, null, 2)
    : "No architecture analysis available.";
  const keyContents = buildKeyFileContents(files);

  const raw = await invokeBedrock(
    [
      {
        role: "user",
        content: AUTO_WALKTHROUGH_USER_PROMPT(archCtx, keyContents),
      },
    ],
    AUTO_WALKTHROUGH_SYSTEM_PROMPT,
    { model: "sonnet", maxTokens: 8192 }
  );

  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "");
  }
  const walkthroughs = JSON.parse(cleaned) as Walkthrough[];

  // Stamp each walkthrough
  for (const w of walkthroughs) {
    w.repoId = repoId;
    w.generatedAt = new Date().toISOString();
  }

  await putAnalysis({
    repoId,
    analysisType: `walkthrough#auto#${new Date().toISOString()}`,
    version: 1,
    content: walkthroughs,
    generatedAt: new Date().toISOString(),
    modelUsed: "anthropic.claude-3-5-sonnet-20241022-v2:0",
  });
  await uploadAnalysisOutput(repoId, "walkthroughs", walkthroughs);

  console.log(
    `[walkthroughs] Generated ${walkthroughs.length} walkthroughs for ${repoId}`
  );
  return walkthroughs;
}

// ─── Environment Setup Analysis ──────────────────────────────────────────────

/**
 * Analyze the codebase to generate an environment setup guide.
 */
export async function runEnvSetupAnalysis(
  input: AnalysisInput
): Promise<EnvSetupGuide> {
  const { repoId } = input;
  let files = input.files;
  if (!files) {
    const stored = await getLatestCodeIndex(repoId);
    if (!stored) throw new Error(`No code index for ${repoId}`);
    files = stored;
  }

  console.log(`[env-setup] Analyzing environment for ${repoId}`);

  const envSetup = await analyzeEnvironmentSetup(files);

  await putAnalysis({
    repoId,
    analysisType: `env-setup#${new Date().toISOString()}`,
    version: 1,
    content: envSetup,
    generatedAt: new Date().toISOString(),
    modelUsed: "anthropic.claude-3-5-sonnet-20241022-v2:0",
  });
  await uploadAnalysisOutput(repoId, "env-setup", envSetup);

  console.log(
    `[env-setup] Complete for ${repoId}: ${envSetup.setupSteps.length} steps`
  );
  return envSetup;
}
