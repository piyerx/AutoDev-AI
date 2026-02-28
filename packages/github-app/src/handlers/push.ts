import type { Context } from "probot";

export async function handlePush(context: Context<"push">) {
  const { repository, ref } = context.payload;
  const defaultBranch = repository.default_branch;

  // Only re-analyze on pushes to the default branch
  if (ref !== `refs/heads/${defaultBranch}`) {
    return;
  }

  context.log.info(`Push to ${repository.full_name}/${defaultBranch} — triggering re-analysis`);

  // TODO: Trigger incremental re-analysis via backend API
  // Compare changed files and decide if full or partial re-analysis is needed
}
