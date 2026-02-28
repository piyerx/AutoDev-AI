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
  question: string;
  steps: WalkthroughStep[];
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
  category: "Architecture" | "Error Handling" | "Naming" | "Testing" | "Styling" | "Other";
  pattern: string;
  description: string;
  examples: string[];
  confidence: number;
}

export interface QAResponse {
  answer: string;
  relevantFiles: { path: string; lineRange?: { start: number; end: number } }[];
  relatedQuestions?: string[];
}

export interface AnalysisResult {
  repoId: string;
  analysisType: "architecture" | "conventions" | "walkthrough";
  version: number;
  content: ArchitectureMap | Convention[] | Walkthrough;
  generatedAt: string;
  modelUsed: string;
}
