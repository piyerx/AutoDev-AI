import type { Context } from "probot";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function handlePush(context: Context<"push">) {
  const { repository, ref, after } = context.payload;
  const defaultBranch = repository.default_branch;

  // Only re-analyze on pushes to the default branch
  if (ref !== `refs/heads/${defaultBranch}`) {
    return;
  }

  const repoId = repository.full_name;
  context.log.info(`Push to ${repoId}/${defaultBranch} (${after}) — triggering re-analysis`);

  try {
    // Fetch updated repo contents
    const { fetchRepoContents } = await import("../services/repoFetcher.js");
    const octokit = await context.octokit;
    const [owner, repo] = repoId.split("/");
    const files = await fetchRepoContents(
      octokit as never,
      owner,
      repo,
      defaultBranch
    );

    context.log.info(`Fetched ${files.length} files from ${repoId} after push`);

    // Send to backend for re-analysis
    const response = await fetch(`${BACKEND_URL}/api/internal/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoId,
        commitSha: after,
        defaultBranch,
        files,
      }),
    });

    if (!response.ok) {
      context.log.error(`Failed to trigger re-analysis for ${repoId}: ${response.status}`);
    } else {
      context.log.info(`Re-analysis triggered for ${repoId}`);
    }
  } catch (error) {
    context.log.error(`Error triggering re-analysis for ${repoId}:`, error as Error);
  }
}
