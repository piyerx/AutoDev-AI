import type { Context } from "probot";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function handleInstallation(context: Context<"installation.created"> | Context<"installation_repositories.added">) {
  const { installation } = context.payload;
  context.log.info(`New installation: ${installation.id}`);

  // Get the list of repositories that were added
  let repos: { full_name: string; default_branch?: string }[] = [];

  if ("repositories" in context.payload) {
    repos = context.payload.repositories || [];
  } else if ("repositories_added" in context.payload) {
    repos = (context.payload as { repositories_added: typeof repos }).repositories_added || [];
  }

  for (const repo of repos) {
    context.log.info(`Processing repo: ${repo.full_name}`);
    const [owner, repoName] = repo.full_name.split("/");

    try {
      // Fetch repo contents using the GitHub API
      const { fetchRepoContents } = await import("../services/repoFetcher.js");
      const octokit = await context.octokit;
      const files = await fetchRepoContents(
        octokit as never,
        owner,
        repoName,
        repo.default_branch || "main"
      );

      context.log.info(`Fetched ${files.length} files from ${repo.full_name}`);

      // Upload to S3 via backend and trigger analysis
      const response = await fetch(`${BACKEND_URL}/api/internal/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoId: repo.full_name,
          installationId: installation.id,
          defaultBranch: repo.default_branch || "main",
          files,
        }),
      });

      if (!response.ok) {
        context.log.error(`Failed to ingest ${repo.full_name}: ${response.status}`);
      } else {
        context.log.info(`Analysis triggered for ${repo.full_name}`);
      }
    } catch (error) {
      context.log.error(`Error processing ${repo.full_name}:`, error as Error);
    }
  }
}
