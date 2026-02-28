export interface Repo {
  repoId: string; // "owner/repo"
  userId: string;
  repoUrl: string;
  defaultBranch: string;
  lastAnalyzedAt?: string;
  analysisStatus: "pending" | "analyzing" | "completed" | "failed";
  techStack?: TechStack;
  fileCount?: number;
}

export interface TechStack {
  runtime?: string;
  framework?: string;
  database?: string;
  orm?: string;
  testing?: string;
  styling?: string;
  [key: string]: string | undefined;
}

export interface RepoFile {
  path: string;
  content: string;
  size: number;
  language?: string;
}
