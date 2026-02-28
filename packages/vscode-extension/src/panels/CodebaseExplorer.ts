import * as vscode from "vscode";

export class CodebaseExplorerProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlContent();

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case "openFile":
          const uri = vscode.Uri.file(message.path);
          await vscode.window.showTextDocument(uri);
          break;
        case "askQuestion":
          vscode.commands.executeCommand("autodev.askQuestion");
          break;
      }
    });
  }

  private _getHtmlContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutoDev Explorer</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      padding: 12px;
      margin: 0;
    }
    h2 { font-size: 14px; margin: 0 0 12px; }
    .status {
      padding: 8px 12px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 4px;
      font-size: 12px;
      margin-bottom: 12px;
    }
    .section {
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      opacity: 0.7;
      margin-bottom: 6px;
    }
    button {
      width: 100%;
      padding: 8px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      margin-bottom: 6px;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    #map-container {
      min-height: 200px;
      border: 1px dashed var(--vscode-panel-border);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      opacity: 0.6;
    }
  </style>
</head>
<body>
  <h2>AutoDev Explorer</h2>

  <div class="status">
    Connect a repo to get started
  </div>

  <div class="section">
    <div class="section-title">Architecture Map</div>
    <div id="map-container">
      No repo analyzed yet
    </div>
  </div>

  <div class="section">
    <div class="section-title">Quick Actions</div>
    <button onclick="askQuestion()">Ask About This Codebase</button>
    <button onclick="startWalkthrough()">Start a Walkthrough</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function askQuestion() {
      vscode.postMessage({ type: 'askQuestion' });
    }

    function startWalkthrough() {
      vscode.postMessage({ type: 'startWalkthrough' });
    }
  </script>
</body>
</html>`;
  }
}
