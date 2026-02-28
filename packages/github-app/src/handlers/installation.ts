import type { Context } from "probot";

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
    context.log.info(`Queuing analysis for repo: ${repo.full_name}`);
    // TODO: Store repo in DynamoDB and trigger analysis via backend API
    // await triggerAnalysis(repo.full_name, installation.id);
  }
}
