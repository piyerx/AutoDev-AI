import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const CLAUDE_SONNET_MODEL = "anthropic.claude-3-5-sonnet-20241022-v2:0";
const CLAUDE_HAIKU_MODEL = "anthropic.claude-3-haiku-20240307-v1:0";

interface BedrockMessage {
  role: "user" | "assistant";
  content: string;
}

interface BedrockOptions {
  model?: "sonnet" | "haiku";
  maxTokens?: number;
  temperature?: number;
}

export async function invokeBedrock(
  messages: BedrockMessage[],
  systemPrompt: string,
  options: BedrockOptions = {}
): Promise<string> {
  const {
    model = "sonnet",
    maxTokens = 4096,
    temperature = 0.3,
  } = options;

  const modelId = model === "haiku" ? CLAUDE_HAIKU_MODEL : CLAUDE_SONNET_MODEL;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: new TextEncoder().encode(body),
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  return responseBody.content[0].text;
}

export async function analyzeArchitecture(
  fileTree: string,
  keyFileContents: string
): Promise<string> {
  const systemPrompt = `You are an expert software architect analyzing a codebase to help new developers onboard quickly.
Analyze the codebase and return a JSON object with this exact structure:
{
  "nodes": [{ "id": "string", "label": "string", "type": "module|service|config|entry|util", "files": ["string"], "description": "string" }],
  "edges": [{ "source": "string", "target": "string", "label": "string" }],
  "techStack": { "key": "value" },
  "summary": "2-3 sentence overview of the project"
}
Return ONLY valid JSON, no markdown or explanation.`;

  const userMessage = `Here is the file tree of the project:\n\n${fileTree}\n\nHere are the key file contents:\n\n${keyFileContents}`;

  return invokeBedrock(
    [{ role: "user", content: userMessage }],
    systemPrompt,
    { model: "sonnet", maxTokens: 8192 }
  );
}

export async function answerQuestion(
  question: string,
  architectureContext: string,
  relevantFiles: string
): Promise<string> {
  const systemPrompt = `You are an AI assistant helping a developer understand a codebase. Answer their question clearly and concisely.
Reference specific files and line numbers when relevant.
Return a JSON object:
{
  "answer": "your detailed answer",
  "relevantFiles": [{ "path": "file/path.ts", "lineRange": { "start": 1, "end": 10 } }],
  "relatedQuestions": ["suggested follow-up question 1", "question 2"]
}
Return ONLY valid JSON.`;

  const userMessage = `Project architecture:\n${architectureContext}\n\nRelevant source files:\n${relevantFiles}\n\nQuestion: ${question}`;

  return invokeBedrock(
    [{ role: "user", content: userMessage }],
    systemPrompt,
    { model: "haiku", maxTokens: 4096 }
  );
}
