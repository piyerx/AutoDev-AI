const BASE_URL = "http://localhost:3001/api";

interface ApiOptions {
  method?: string;
  body?: unknown;
}

async function apiCall<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body } = options;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function getArchitecture(owner: string, repo: string) {
  return apiCall(`/analysis/${owner}/${repo}/architecture`);
}

export async function getWalkthroughs(owner: string, repo: string) {
  return apiCall(`/walkthroughs/${owner}/${repo}`);
}

export async function generateWalkthrough(owner: string, repo: string, question: string) {
  return apiCall(`/walkthroughs/${owner}/${repo}`, {
    method: "POST",
    body: { question },
  });
}

export async function getConventions(owner: string, repo: string) {
  return apiCall(`/conventions/${owner}/${repo}`);
}

export async function askQuestion(
  owner: string,
  repo: string,
  question: string,
  language: string = "en",
  fresherMode: boolean = false
) {
  return apiCall(`/qa/${owner}/${repo}`, {
    method: "POST",
    body: { question, language, fresherMode },
  });
}

export async function getAnimationSequences(owner: string, repo: string) {
  return apiCall(`/animated/${owner}/${repo}`);
}

export async function generateAnimationSequences(
  owner: string,
  repo: string,
  fresherMode: boolean = false
) {
  return apiCall(`/animated/${owner}/${repo}/generate`, {
    method: "POST",
    body: { fresherMode },
  });
}

export async function explainNode(
  owner: string,
  repo: string,
  nodeId: string,
  fresherMode: boolean = false
) {
  return apiCall(`/animated/${owner}/${repo}/explain-node`, {
    method: "POST",
    body: { nodeId, fresherMode },
  });
}

export async function getSupportedLanguages() {
  return apiCall(`/i18n/languages`);
}

export async function translateText(
  text: string,
  targetLanguage: string,
  repoId: string,
  fresherMode: boolean = false
) {
  return apiCall(`/i18n/translate`, {
    method: "POST",
    body: { text, targetLanguage, repoId, fresherMode },
  });
}
