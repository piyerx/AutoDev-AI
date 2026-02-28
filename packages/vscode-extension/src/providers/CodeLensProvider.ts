import * as vscode from "vscode";
import { getArchitecture } from "../api/client";

interface ArchNode {
  id: string;
  label: string;
  type: string;
  description: string;
  files: string[];
}

interface ArchData {
  nodes: ArchNode[];
  edges: { source: string; target: string; label?: string }[];
  summary?: string;
}

/**
 * Provides CodeLens annotations on source files showing which architecture
 * module they belong to and their connections.
 */
export class AutoDevCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChangeCodeLenses = this._onDidChange.event;

  private archData: ArchData | null = null;
  private loading = false;
  private fileIndex = new Map<string, ArchNode[]>(); // filepath → nodes

  constructor() {
    this.loadArchitecture();
  }

  async loadArchitecture(): Promise<void> {
    const repoId = vscode.workspace
      .getConfiguration("autodev")
      .get<string>("repoId");
    if (!repoId || this.loading) return;

    this.loading = true;
    try {
      const [owner, repo] = repoId.split("/");
      if (!owner || !repo) return;

      const data = (await getArchitecture(owner, repo)) as {
        content?: ArchData;
        nodes?: ArchNode[];
      };

      this.archData = (data.content as ArchData) ?? (data as unknown as ArchData);
      this.buildFileIndex();
      this._onDidChange.fire();
    } catch {
      // Architecture not available yet
    } finally {
      this.loading = false;
    }
  }

  private buildFileIndex(): void {
    this.fileIndex.clear();
    if (!this.archData?.nodes) return;

    for (const node of this.archData.nodes) {
      if (!node.files) continue;
      for (const filePath of node.files) {
        const normalized = this.normalizePath(filePath);
        const existing = this.fileIndex.get(normalized) || [];
        existing.push(node);
        this.fileIndex.set(normalized, existing);
      }
    }
  }

  private normalizePath(filePath: string): string {
    // Strip leading ./ and normalize separators
    return filePath.replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase();
  }

  private getRelativePath(uri: vscode.Uri): string | null {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (!workspaceFolder) return null;
    return vscode.workspace.asRelativePath(uri, false).replace(/\\/g, "/").toLowerCase();
  }

  provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.CodeLens[] {
    if (!this.archData) return [];

    const relativePath = this.getRelativePath(document.uri);
    if (!relativePath) return [];

    // Find matching nodes — try exact match and partial match
    const matchingNodes = this.findMatchingNodes(relativePath);
    if (matchingNodes.length === 0) return [];

    const lenses: vscode.CodeLens[] = [];
    const topRange = new vscode.Range(0, 0, 0, 0);

    for (const node of matchingNodes) {
      // Module badge
      const typeEmoji = this.getTypeEmoji(node.type);
      lenses.push(
        new vscode.CodeLens(topRange, {
          title: `${typeEmoji} AutoDev: ${node.label} (${node.type})`,
          command: "autodev.showNodeDetail",
          arguments: [node],
        })
      );

      // Short description
      if (node.description) {
        const truncated =
          node.description.length > 80
            ? node.description.slice(0, 77) + "..."
            : node.description;
        lenses.push(
          new vscode.CodeLens(topRange, {
            title: `    ℹ️ ${truncated}`,
            command: "",
          })
        );
      }

      // Connected modules
      const connections = this.getConnections(node.id);
      if (connections.length > 0) {
        const labels = connections.map((c) => c.label).join(", ");
        lenses.push(
          new vscode.CodeLens(topRange, {
            title: `    🔗 Connected: ${labels}`,
            command: "autodev.showExplorer",
          })
        );
      }
    }

    return lenses;
  }

  private findMatchingNodes(relativePath: string): ArchNode[] {
    // Try exact match first
    const exact = this.fileIndex.get(relativePath);
    if (exact) return exact;

    // Try partial matching (file might be referenced without full path in analysis)
    const matches: ArchNode[] = [];
    for (const [indexedPath, nodes] of this.fileIndex) {
      if (
        relativePath.endsWith(indexedPath) ||
        indexedPath.endsWith(relativePath) ||
        relativePath.includes(indexedPath) ||
        indexedPath.includes(relativePath)
      ) {
        matches.push(...nodes);
      }
    }

    // Deduplicate by node id
    const seen = new Set<string>();
    return matches.filter((n) => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });
  }

  private getConnections(nodeId: string): ArchNode[] {
    if (!this.archData) return [];

    const connectedIds = new Set<string>();
    for (const edge of this.archData.edges) {
      if (edge.source === nodeId) connectedIds.add(edge.target);
      if (edge.target === nodeId) connectedIds.add(edge.source);
    }

    return this.archData.nodes.filter((n) => connectedIds.has(n.id));
  }

  private getTypeEmoji(type: string): string {
    const map: Record<string, string> = {
      frontend: "🖥️",
      backend: "⚙️",
      database: "🗄️",
      api: "🌐",
      service: "🔧",
      library: "📚",
      config: "⚡",
      test: "🧪",
      infrastructure: "☁️",
      auth: "🔒",
    };
    return map[type.toLowerCase()] || "📦";
  }

  refresh(): void {
    this.loadArchitecture();
  }
}
