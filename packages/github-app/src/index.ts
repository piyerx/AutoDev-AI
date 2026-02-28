import "dotenv/config";
import { Probot, run } from "probot";
import { handleInstallation } from "./handlers/installation.js";
import { handlePush } from "./handlers/push.js";
import { handlePullRequest } from "./handlers/pullRequest.js";

function autodevApp(app: Probot) {
  app.log.info("AutoDev GitHub App loaded");

  // New app installation — index the repo
  app.on("installation.created", handleInstallation);
  app.on("installation_repositories.added", handleInstallation);

  // Code pushed to default branch — trigger re-analysis
  app.on("push", handlePush);

  // PR opened — post onboarding context
  app.on(["pull_request.opened", "pull_request.synchronize"], handlePullRequest);
}

// Start the Probot server
run(autodevApp).catch((err) => {
  console.error("Failed to start AutoDev GitHub App:", err);
  process.exit(1);
});
