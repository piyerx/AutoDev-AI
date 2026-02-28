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
  return apiCall(`/analysis/${owner}/${repo}/walkthroughs`);
}

export async function getConventions(owner: string, repo: string) {
  return apiCall(`/analysis/${owner}/${repo}/conventions`);
}

export async function askQuestion(
  owner: string,
  repo: string,
  question: string
) {
  return apiCall(`/qa/${owner}/${repo}`, {
    method: "POST",
    body: { question },
  });
}
