/**
 * Environment analyzer service.
 * Scans repo files for setup requirements: .nvmrc, Dockerfile, docker-compose.yml,
 * .env.example, package.json engines, Makefile, etc.
 */

import type { EnvSetupGuide } from "@autodev/shared";
import { invokeBedrock } from "./bedrock.js";
import {
  ENV_SETUP_SYSTEM_PROMPT,
  ENV_SETUP_USER_PROMPT,
} from "../prompts/envSetup.js";

/** Patterns for config/setup files we want to analyze */
const CONFIG_PATTERNS = [
  /^\.nvmrc$/,
  /^\.node-version$/,
  /^\.python-version$/,
  /^\.ruby-version$/,
  /^\.tool-versions$/,
  /^package\.json$/,
  /^requirements\.txt$/,
  /^pyproject\.toml$/,
  /^go\.mod$/,
  /^Cargo\.toml$/,
  /^Gemfile$/,
  /^Dockerfile$/i,
  /^docker-compose.*\.ya?ml$/,
  /^\.env\.example$/,
  /^\.env\.sample$/,
  /^\.env\.template$/,
  /^Makefile$/,
  /^Procfile$/,
  /^Vagrantfile$/,
  /^\.editorconfig$/,
  /^\.eslintrc/,
  /^tsconfig.*\.json$/,
  /^vite\.config/,
  /^webpack\.config/,
  /^next\.config/,
  /^angular\.json$/,
  /^pnpm-workspace\.yaml$/,
  /^lerna\.json$/,
  /^nx\.json$/,
  /^turbo\.json$/,
];

/** Patterns that indicate README/docs */
const README_PATTERNS = [
  /^README\.md$/i,
  /^CONTRIBUTING\.md$/i,
  /^SETUP\.md$/i,
  /^INSTALL\.md$/i,
  /^docs\/.*setup/i,
  /^docs\/.*getting.?started/i,
];

/**
 * Extract config files, README, and source file samples from a repo's files.
 */
export function categorizeFiles(files: { path: string; content: string }[]) {
  const configFiles: { path: string; content: string }[] = [];
  const readmeFiles: { path: string; content: string }[] = [];
  const sourceFiles: { path: string; content: string }[] = [];

  for (const file of files) {
    const basename = file.path.split("/").pop() || file.path;

    if (CONFIG_PATTERNS.some((p) => p.test(basename) || p.test(file.path))) {
      configFiles.push(file);
    } else if (README_PATTERNS.some((p) => p.test(basename) || p.test(file.path))) {
      readmeFiles.push(file);
    } else {
      sourceFiles.push(file);
    }
  }

  return { configFiles, readmeFiles, sourceFiles };
}

/**
 * Build a formatted string of config file contents for the prompt.
 */
function formatConfigFiles(files: { path: string; content: string }[]): string {
  return files
    .map((f) => `--- ${f.path} ---\n${f.content.slice(0, 5000)}`)
    .join("\n\n");
}

/**
 * Build README content string (combine all docs).
 */
function formatReadme(files: { path: string; content: string }[]): string {
  if (files.length === 0) return "No README or setup documentation found.";
  return files
    .map((f) => `--- ${f.path} ---\n${f.content.slice(0, 8000)}`)
    .join("\n\n");
}

/**
 * Build a sample of source files to detect undocumented dependencies.
 * Focuses on imports and requires.
 */
function formatSourceSample(files: { path: string; content: string }[]): string {
  // Extract just the import/require lines from source files
  const importLines: string[] = [];
  const sampled = files.slice(0, 30);

  for (const f of sampled) {
    const lines = f.content.split("\n");
    const imports = lines.filter(
      (l) =>
        /^\s*(import|from|require|using|include|#include)/.test(l) ||
        /^\s*const\s+.*=\s*require\(/.test(l)
    );
    if (imports.length > 0) {
      importLines.push(`--- ${f.path} ---\n${imports.join("\n")}`);
    }
  }

  return importLines.join("\n\n") || "No source files with imports found.";
}

/**
 * Analyze a repo's files and generate an environment setup guide using Bedrock.
 */
export async function analyzeEnvironmentSetup(
  files: { path: string; content: string; size: number }[]
): Promise<EnvSetupGuide> {
  const { configFiles, readmeFiles, sourceFiles } = categorizeFiles(files);

  const configStr = formatConfigFiles(configFiles);
  const readmeStr = formatReadme(readmeFiles);
  const sourceStr = formatSourceSample(sourceFiles);

  console.log(
    `[envAnalyzer] Analyzing setup: ${configFiles.length} config files, ${readmeFiles.length} docs, ${sourceFiles.length} source files`
  );

  const rawResponse = await invokeBedrock(
    [
      {
        role: "user",
        content: ENV_SETUP_USER_PROMPT(configStr, readmeStr, sourceStr),
      },
    ],
    ENV_SETUP_SYSTEM_PROMPT,
    { model: "sonnet", maxTokens: 8192 }
  );

  // Parse JSON response
  let cleaned = rawResponse.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "");
  }

  const result = JSON.parse(cleaned) as EnvSetupGuide;

  // Ensure all required fields exist with defaults
  return {
    setupSteps: result.setupSteps || [],
    conflicts: result.conflicts || [],
    missingPieces: result.missingPieces || [],
    envVariables: result.envVariables || [],
    dockerSupport: result.dockerSupport || {
      hasDockerfile: false,
      hasCompose: false,
    },
    estimatedSetupTime: result.estimatedSetupTime || "Unknown",
    requiredTools: result.requiredTools || [],
    summary: result.summary || "Environment setup analysis complete.",
  };
}
