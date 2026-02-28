/**
 * Walkthrough generation prompts for Bedrock Claude.
 * Generates step-by-step code walkthroughs from a user question + architecture context.
 */

export const WALKTHROUGH_SYSTEM_PROMPT = `You are an expert developer mentor generating step-by-step code walkthroughs for new developers onboarding to a codebase.

Given an architecture overview and relevant source files, create a guided walkthrough that explains a specific flow or concept.

Return a JSON object with this EXACT structure (no markdown, no explanation — only valid JSON):

{
  "id": "walkthrough-slug",
  "title": "Human Readable Walkthrough Title",
  "description": "1-2 sentence summary of what this walkthrough covers",
  "difficulty": "beginner|intermediate|advanced",
  "estimatedMinutes": 10,
  "steps": [
    {
      "stepNumber": 1,
      "file": "src/path/to/file.ts",
      "lineRange": { "start": 1, "end": 20 },
      "title": "Step title",
      "explanation": "Clear explanation of what this code does and why, written for a new developer. Use analogies when helpful.",
      "codeSnippet": "relevant code snippet from the file",
      "nextStepHint": "Now let's see how this connects to..."
    }
  ],
  "prerequisites": ["concept or module to understand first"],
  "relatedModules": ["module-id-1", "module-id-2"]
}

Guidelines:
- Start from the entry point and follow the flow logically
- Each step should build on the previous one
- Explain WHY code is written this way, not just WHAT it does
- Keep explanations beginner-friendly with analogies
- Include 4-10 steps per walkthrough
- Reference specific files and line ranges
- The codeSnippet should be the most relevant 5-15 lines
- Return ONLY valid JSON. No markdown fences, no explanation text.`;

export const WALKTHROUGH_USER_PROMPT = (
  question: string,
  architectureContext: string,
  relevantFiles: string
) =>
  `## Walkthrough Request

The developer wants to understand: "${question}"

### Architecture Context
${architectureContext}

### Relevant Source Files
${relevantFiles}

Generate a step-by-step walkthrough that guides the developer through the codebase to answer their question. Start from the most logical entry point and follow the flow.`;

/**
 * Pre-generated walkthrough prompt — generates walkthroughs for key flows
 * identified during architecture analysis.
 */
export const AUTO_WALKTHROUGH_SYSTEM_PROMPT = `You are an expert developer mentor. Given a codebase architecture analysis and source files, identify the 3-5 most important flows/concepts a new developer should understand first.

For each flow, generate a walkthrough. Return a JSON array of walkthroughs:

[
  {
    "id": "walkthrough-slug",
    "title": "Human Readable Title",
    "description": "1-2 sentence summary",
    "difficulty": "beginner|intermediate|advanced",
    "estimatedMinutes": 10,
    "steps": [
      {
        "stepNumber": 1,
        "file": "src/path/to/file.ts",
        "lineRange": { "start": 1, "end": 20 },
        "title": "Step title",
        "explanation": "Clear explanation for a new developer",
        "codeSnippet": "relevant code snippet",
        "nextStepHint": "Next we'll see..."
      }
    ],
    "prerequisites": [],
    "relatedModules": ["module-id"]
  }
]

Focus on:
1. The main entry point / request lifecycle
2. The core business logic flow
3. Data persistence / storage patterns
4. Authentication / authorization (if present)
5. Key integrations or APIs

Return ONLY valid JSON array. No markdown fences, no explanation text.`;

export const AUTO_WALKTHROUGH_USER_PROMPT = (
  architectureContext: string,
  keyFileContents: string
) =>
  `## Auto-Generate Onboarding Walkthroughs

### Architecture Analysis
${architectureContext}

### Key Source Files
${keyFileContents}

Generate 3-5 walkthroughs covering the most important flows a new developer needs to understand.`;
