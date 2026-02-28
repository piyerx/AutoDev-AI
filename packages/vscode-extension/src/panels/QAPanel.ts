import * as vscode from "vscode";

export class QAPanel {
  public static currentPanel: QAPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.webview.html = this._getHtmlContent();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.type) {
          case "ask":
            // TODO: Call backend API with message.question
            this._panel.webview.postMessage({
              type: "answer",
              data: {
                answer: `Analyzing your question: "${message.question}"...\n\nBackend API integration coming soon.`,
                relevantFiles: [],
                relatedQuestions: [
                  "How is the project structured?",
                  "What patterns does this codebase use?",
                ],
              },
            });
            break;
          case "openFile":
            const uri = vscode.Uri.file(message.path);
            await vscode.window.showTextDocument(uri);
            break;
        }
      },
      null,
      this._disposables
    );
  }

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (QAPanel.currentPanel) {
      QAPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "autodevQA",
      "AutoDev Q&A",
      column || vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true }
    );

    QAPanel.currentPanel = new QAPanel(panel, extensionUri);
  }

  public dispose() {
    QAPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const d = this._disposables.pop();
      if (d) d.dispose();
    }
  }

  private _getHtmlContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutoDev Q&A</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 16px;
      margin: 0;
    }
    h2 { margin: 0 0 16px; font-size: 16px; }
    #messages {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 12px;
      min-height: 300px;
    }
    .message {
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 13px;
      line-height: 1.5;
    }
    .user-msg {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      margin-left: 40px;
    }
    .ai-msg {
      background: var(--vscode-editor-inactiveSelectionBackground);
      margin-right: 40px;
      white-space: pre-wrap;
    }
    .input-row {
      display: flex;
      gap: 8px;
    }
    input {
      flex: 1;
      padding: 8px 12px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      font-size: 13px;
    }
    button {
      padding: 8px 16px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .empty-state {
      text-align: center;
      opacity: 0.5;
      padding: 40px 0;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <h2>Ask About This Codebase</h2>
  <div id="messages">
    <div class="empty-state">Ask any question about this codebase and AutoDev will find the answer.</div>
  </div>
  <div class="input-row">
    <input type="text" id="question" placeholder="e.g., How does authentication work?" />
    <button onclick="sendQuestion()">Ask</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const messagesDiv = document.getElementById('messages');
    const questionInput = document.getElementById('question');
    let firstMessage = true;

    function sendQuestion() {
      const question = questionInput.value.trim();
      if (!question) return;

      if (firstMessage) {
        messagesDiv.innerHTML = '';
        firstMessage = false;
      }

      messagesDiv.innerHTML += '<div class="message user-msg">' + escapeHtml(question) + '</div>';
      questionInput.value = '';

      vscode.postMessage({ type: 'ask', question });
    }

    questionInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendQuestion();
    });

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'answer') {
        messagesDiv.innerHTML += '<div class="message ai-msg">' + escapeHtml(msg.data.answer) + '</div>';
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }
    });

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
  }
}
