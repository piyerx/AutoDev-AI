import * as vscode from "vscode";
import { CodebaseExplorerProvider } from "./panels/CodebaseExplorer";
import { QAPanel } from "./panels/QAPanel";
import { WalkthroughPanel } from "./panels/WalkthroughPanel";
import { AutoDevCodeLensProvider } from "./providers/CodeLensProvider";
import { explainNode } from "./api/client";

export function activate(context: vscode.ExtensionContext) {
  console.log("AutoDev extension activated");

  // Register the Codebase Explorer webview provider
  const explorerProvider = new CodebaseExplorerProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "autodev.explorerView",
      explorerProvider
    )
  );

  // Register CodeLens provider for architecture annotations
  const codeLensProvider = new AutoDevCodeLensProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { scheme: "file" },
      codeLensProvider
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("autodev.showExplorer", () => {
      vscode.commands.executeCommand("autodev.explorerView.focus");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("autodev.askQuestion", async () => {
      QAPanel.createOrShow(context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("autodev.startWalkthrough", async () => {
      const question = await vscode.window.showInputBox({
        prompt: "What do you want to understand about this codebase?",
        placeHolder: "e.g., How does authentication work?",
      });
      if (question) {
        vscode.window.showInformationMessage(
          `AutoDev: Generating walkthrough for "${question}"...`
        );
        WalkthroughPanel.createOrShow(context.extensionUri);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("autodev.showWalkthroughs", () => {
      WalkthroughPanel.createOrShow(context.extensionUri);
    })
  );

  // Show node detail — triggered from CodeLens
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "autodev.showNodeDetail",
      async (node: { id: string; label: string; type: string; description: string; files: string[] }) => {
        const repoId = vscode.workspace
          .getConfiguration("autodev")
          .get<string>("repoId");
        if (!repoId) {
          vscode.window.showWarningMessage(
            "Set autodev.repoId in settings (e.g. owner/repo)"
          );
          return;
        }
        const [owner, repo] = repoId.split("/");

        const panel = vscode.window.createWebviewPanel(
          "autodevNodeDetail",
          `AutoDev: ${node.label}`,
          vscode.ViewColumn.Beside,
          { enableScripts: false }
        );

        // Show basic info immediately
        panel.webview.html = buildNodeDetailHtml(node, "Loading AI explanation...");

        // Fetch AI explanation
        try {
          const data = (await explainNode(owner, repo, node.id)) as {
            explanation: string;
          };
          panel.webview.html = buildNodeDetailHtml(node, data.explanation);
        } catch {
          panel.webview.html = buildNodeDetailHtml(
            node,
            node.description || "No explanation available."
          );
        }
      }
    )
  );

  // Refresh CodeLens
  context.subscriptions.push(
    vscode.commands.registerCommand("autodev.refreshCodeLens", () => {
      codeLensProvider.refresh();
      vscode.window.showInformationMessage("AutoDev: CodeLens refreshed");
    })
  );

  // Select language
  context.subscriptions.push(
    vscode.commands.registerCommand("autodev.selectLanguage", async () => {
      const LANGS = [
        { label: "English", code: "en" },
        { label: "हिन्दी (Hindi)", code: "hi" },
        { label: "தமிழ் (Tamil)", code: "ta" },
        { label: "తెలుగు (Telugu)", code: "te" },
        { label: "ಕನ್ನಡ (Kannada)", code: "kn" },
        { label: "বাংলা (Bengali)", code: "bn" },
        { label: "मराठी (Marathi)", code: "mr" },
      ];
      const pick = await vscode.window.showQuickPick(LANGS, {
        placeHolder: "Select language for AI responses",
      });
      if (pick) {
        await vscode.workspace
          .getConfiguration("autodev")
          .update("language", pick.code, true);
        vscode.window.showInformationMessage(
          `AutoDev: Language set to ${pick.label}`
        );
      }
    })
  );

  // Status bar item
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBar.text = "$(compass) AutoDev";
  statusBar.tooltip = "AutoDev Codebase Onboarding";
  statusBar.command = "autodev.showExplorer";
  statusBar.show();
  context.subscriptions.push(statusBar);
}

function buildNodeDetailHtml(
  node: { id: string; label: string; type: string; description: string; files: string[] },
  explanation: string
): string {
  const filesList = (node.files || [])
    .map((f) => `<li><code>${f}</code></li>`)
    .join("");
  return `<!DOCTYPE html>
<html><head><style>
  body { font-family: var(--vscode-font-family); padding: 16px; color: var(--vscode-foreground); }
  h1 { font-size: 1.4em; margin-bottom: 4px; }
  .type { opacity: 0.6; font-size: 0.85em; margin-bottom: 16px; }
  .section { margin-bottom: 16px; }
  .section h2 { font-size: 1em; margin-bottom: 6px; opacity: 0.8; }
  .explanation { line-height: 1.5; white-space: pre-line; }
  code { background: var(--vscode-textCodeBlock-background); padding: 1px 4px; border-radius: 3px; font-size: 0.9em; }
  ul { padding-left: 20px; }
  li { margin-bottom: 2px; }
</style></head><body>
  <h1>${node.label}</h1>
  <div class="type">${node.type}</div>
  <div class="section"><h2>Explanation</h2><div class="explanation">${explanation}</div></div>
  ${filesList ? `<div class="section"><h2>Files</h2><ul>${filesList}</ul></div>` : ""}
</body></html>`;
}

export function deactivate() {
  console.log("AutoDev extension deactivated");
}
