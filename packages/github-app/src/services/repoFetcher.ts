import type { Octokit } from "@octokit/rest";

interface FetchedFile {
  path: string;
  content: string;
  size: number;
}

const SKIP_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
  ".woff", ".woff2", ".ttf", ".eot",
  ".zip", ".tar", ".gz", ".jar",
  ".lock", ".min.js", ".min.css",
]);

const MAX_FILE_SIZE = 100_000; // 100KB per file
const MAX_FILES = 500;

export async function fetchRepoContents(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string
): Promise<FetchedFile[]> {
  // Get the full file tree
  const { data: tree } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: branch,
    recursive: "true",
  });

  // Filter to relevant code files
  const codeFiles = tree.tree.filter((item) => {
    if (item.type !== "blob" || !item.path) return false;
    if ((item.size || 0) > MAX_FILE_SIZE) return false;

    const ext = item.path.substring(item.path.lastIndexOf("."));
    if (SKIP_EXTENSIONS.has(ext)) return false;

    // Skip common non-code directories
    if (item.path.startsWith("node_modules/")) return false;
    if (item.path.startsWith(".git/")) return false;
    if (item.path.startsWith("vendor/")) return false;
    if (item.path.startsWith("dist/")) return false;
    if (item.path.startsWith(".next/")) return false;

    return true;
  });

  // Limit to MAX_FILES, prioritizing config files and entry points
  const prioritized = codeFiles.sort((a, b) => {
    const aPath = a.path || "";
    const bPath = b.path || "";
    const aPriority = getFilePriority(aPath);
    const bPriority = getFilePriority(bPath);
    return bPriority - aPriority;
  });

  const selected = prioritized.slice(0, MAX_FILES);

  // Fetch file contents
  const files: FetchedFile[] = [];
  for (const item of selected) {
    try {
      const { data } = await octokit.git.getBlob({
        owner,
        repo,
        file_sha: item.sha!,
      });

      const content =
        data.encoding === "base64"
          ? Buffer.from(data.content, "base64").toString("utf-8")
          : data.content;

      files.push({
        path: item.path!,
        content,
        size: data.size,
      });
    } catch {
      // Skip files that can't be read (binary, too large, etc.)
    }
  }

  return files;
}

function getFilePriority(path: string): number {
  // Config files and entry points get highest priority
  if (path === "package.json" || path === "tsconfig.json") return 100;
  if (path.endsWith("README.md")) return 90;
  if (path.includes("index.") || path.includes("main.")) return 80;
  if (path.includes("app.") || path.includes("server.")) return 75;
  if (path.includes("config")) return 70;
  if (path.endsWith(".env.example")) return 65;

  // Source code files
  const depth = path.split("/").length;
  if (depth <= 2) return 60; // Root or first-level files
  if (depth <= 3) return 50;
  return 40 - depth; // Deeper files get lower priority
}
