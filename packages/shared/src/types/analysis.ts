export interface ArchitectureNode {
  id: string;
  label: string;
  type: "module" | "service" | "config" | "entry" | "util" | "database" | "external";
  files: string[];
  description: string;
}

export interface ArchitectureEdge {
  source: string;
  target: string;
  label?: string;
}

export interface ArchitectureMap {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  techStack: Record<string, string>;
  summary: string;
  entryPoints?: string[];
  keyPatterns?: string[];
}

export interface Walkthrough {
  id: string;
  repoId: string;
  title?: string;
  description?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  estimatedMinutes?: number;
  question: string;
  steps: WalkthroughStep[];
  prerequisites?: string[];
  relatedModules?: string[];
  generatedAt: string;
}

export interface WalkthroughStep {
  stepNumber: number;
  file: string;
  lineRange?: { start: number; end: number };
  title: string;
  explanation: string;
  codeSnippet?: string;
  nextStepHint?: string;
}

export interface Convention {
  category: "Architecture" | "Error Handling" | "Naming" | "Testing" | "Styling" | "API Design" | "State Management" | "Security" | "Other";
  pattern: string;
  description: string;
  examples: string[];
  confidence: number;
  severity?: "must-follow" | "should-follow" | "nice-to-have";
  doExample?: string;
  dontExample?: string;
}

export interface QAResponse {
  answer: string;
  relevantFiles: { path: string; lineRange?: { start: number; end: number } }[];
  relatedQuestions?: string[];
}

// --- Environment Setup Types ---

export interface SetupStep {
  order: number;
  category: "runtime" | "package-manager" | "database" | "cache" | "env-vars" | "docker" | "build" | "test" | "other";
  title: string;
  command?: string;
  description: string;
  source: string;
  required: boolean;
  platform: "all" | "windows" | "macos" | "linux";
  verifyCommand?: string;
  expectedOutput?: string;
}

export interface SetupConflict {
  severity: "error" | "warning";
  description: string;
  sources: string[];
  resolution: string;
}

export interface MissingPiece {
  severity: "error" | "warning" | "info";
  description: string;
  evidence: string;
  suggestion: string;
}

export interface EnvVariable {
  name: string;
  required: boolean;
  description: string;
  source: string;
  defaultValue?: string;
  sensitive: boolean;
}

export interface DockerSupport {
  hasDockerfile: boolean;
  hasCompose: boolean;
  composeServices?: string[];
  quickStart?: string;
}

export interface EnvSetupGuide {
  setupSteps: SetupStep[];
  conflicts: SetupConflict[];
  missingPieces: MissingPiece[];
  envVariables: EnvVariable[];
  dockerSupport: DockerSupport;
  estimatedSetupTime: string;
  requiredTools: string[];
  summary: string;
}

export interface AnalysisResult {
  repoId: string;
  analysisType: "architecture" | "conventions" | "walkthrough" | "env-setup";
  version: number;
  content: ArchitectureMap | Convention[] | Walkthrough | EnvSetupGuide;
  generatedAt: string;
  modelUsed: string;
}
