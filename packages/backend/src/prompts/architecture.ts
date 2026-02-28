/**
 * Architecture analysis prompts for Bedrock Claude.
 * Two-pass approach: Pass 1 scans file tree + configs, Pass 2 reads key files.
 */

export const ARCHITECTURE_SYSTEM_PROMPT = `You are an expert software architect analyzing a codebase to help new developers onboard quickly.
Your goal is to identify the major modules, services, and components and how they connect.

Analyze the codebase and return a JSON object with this EXACT structure (no markdown, no explanation — only valid JSON):

{
  "nodes": [
    {
      "id": "unique-slug",
      "label": "Human Readable Name",
      "type": "module|service|config|entry|util|database|external",
      "files": ["src/path/file.ts"],
      "description": "1-2 sentence description of what this module does"
    }
  ],
  "edges": [
    {
      "source": "node-id",
      "target": "node-id",
      "label": "imports|calls|reads|writes|extends"
    }
  ],
  "techStack": {
    "runtime": "Node.js",
    "framework": "Express",
    "language": "TypeScript"
  },
  "summary": "2-3 sentence overview of the entire project architecture",
  "entryPoints": ["src/index.ts"],
  "keyPatterns": ["pattern 1 used in the codebase", "pattern 2"]
}

Guidelines:
- Group related files into logical nodes (don't create one node per file)
- Create 5-15 nodes for most projects (fewer for small projects)
- Identify entry points (main files, server start, etc.)
- Mark external services as type "external" (databases, APIs, etc.)
- Edge labels should describe the relationship (imports, calls, reads, writes)
- techStack should identify runtime, framework, language, database, testing, styling
- Return ONLY valid JSON. No markdown fences, no explanation text.`;

export const ARCHITECTURE_PASS1_USER_PROMPT = (fileTree: string, configContents: string) =>
  `## Pass 1: File Tree & Configuration Analysis

Here is the complete file tree of the project:

${fileTree}

Here are the configuration files:

${configContents}

Based on the file tree structure and configuration files:
1. Identify the major modules/packages
2. Detect the tech stack from package.json, config files, etc.
3. Map out the high-level architecture

Return the architecture analysis as JSON.`;

export const ARCHITECTURE_PASS2_USER_PROMPT = (
  pass1Result: string,
  keyFileContents: string
) =>
  `## Pass 2: Deep File Analysis

Here is the preliminary architecture analysis from Pass 1:
${pass1Result}

Here are the key source file contents for deeper analysis:

${keyFileContents}

Refine and improve the architecture analysis:
1. Verify the module boundaries are correct
2. Add missing edges/dependencies based on actual imports
3. Improve descriptions now that you can see the actual code
4. Identify design patterns in use

Return the COMPLETE updated architecture analysis as JSON (same schema as before).`;

/**
 * Helpers for building file tree and key file content strings.
 */

export function buildFileTree(files: { path: string; size: number }[]): string {
  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));
  return sorted.map((f) => `${f.path} (${formatSize(f.size)})`).join("\n");
}

export function buildConfigContents(
  files: { path: string; content: string }[]
): string {
  const configPatterns = [
    /package\.json$/,
    /tsconfig.*\.json$/,
    /\.env\.example$/,
    /README\.md$/,
    /Dockerfile$/,
    /docker-compose.*\.ya?ml$/,
    /\.eslintrc/,
    /next\.config/,
    /vite\.config/,
    /webpack\.config/,
    /tailwind\.config/,
    /prisma\/schema\.prisma$/,
    /requirements\.txt$/,
    /pyproject\.toml$/,
    /Cargo\.toml$/,
    /go\.mod$/,
  ];

  return files
    .filter((f) => configPatterns.some((p) => p.test(f.path)))
    .map((f) => `--- ${f.path} ---\n${truncate(f.content, 3000)}`)
    .join("\n\n");
}

export function buildKeyFileContents(
  files: { path: string; content: string }[],
  maxTotalChars = 50000
): string {
  // Prioritize entry points and important source files
  const prioritized = [...files]
    .filter((f) => !isConfigFile(f.path))
    .sort((a, b) => getFilePriority(b.path) - getFilePriority(a.path));

  let total = 0;
  const selected: string[] = [];

  for (const f of prioritized) {
    const entry = `--- ${f.path} ---\n${truncate(f.content, 5000)}`;
    if (total + entry.length > maxTotalChars) break;
    selected.push(entry);
    total += entry.length;
  }

  return selected.join("\n\n");
}

function isConfigFile(path: string): boolean {
  return /\.(json|ya?ml|toml|lock|env)$/.test(path) || path === "Dockerfile";
}

function getFilePriority(path: string): number {
  if (/index\.(ts|js|tsx|jsx|py)$/.test(path)) return 100;
  if (/main\.(ts|js|tsx|jsx|py)$/.test(path)) return 95;
  if (/app\.(ts|js|tsx|jsx|py)$/.test(path)) return 90;
  if (/server\.(ts|js|tsx|jsx|py)$/.test(path)) return 85;
  if (/route|handler|controller/i.test(path)) return 80;
  if (/service|provider|client/i.test(path)) return 75;
  if (/model|schema|type/i.test(path)) return 70;
  if (/middleware|hook|util/i.test(path)) return 65;
  if (/component|page|view/i.test(path)) return 60;

  const depth = path.split("/").length;
  return Math.max(10, 50 - depth * 5);
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "\n... (truncated)";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
