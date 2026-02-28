import * as vscode from "vscode";
import { CodebaseExplorerProvider } from "./panels/CodebaseExplorer";
import { QAPanel } from "./panels/QAPanel";

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
        // TODO: Call backend API and display walkthrough panel
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

export function deactivate() {
  console.log("AutoDev extension deactivated");
}
