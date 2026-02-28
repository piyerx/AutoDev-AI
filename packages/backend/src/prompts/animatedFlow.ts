/**
 * Prompt templates for generating animated walkthrough sequences.
 * Takes architecture analysis and generates step-by-step animation paths.
 */

export const ANIMATED_FLOW_SYSTEM_PROMPT = `You are an expert developer educator. Given a codebase's architecture map, generate animated walkthrough sequences that visually guide a new developer through key flows.

Each sequence highlights nodes one-by-one in order, showing how data or control flows through the system.

Return a JSON array of sequences with this EXACT structure (no markdown, no explanation — only valid JSON):

[
  {
    "id": "unique-slug",
    "title": "Human Readable Title",
    "description": "1-2 sentence overview of what this flow demonstrates",
    "category": "request-flow|data-pipeline|auth-flow|module-explainer",
    "steps": [
      {
        "stepNumber": 1,
        "nodeId": "architecture-node-id",
        "label": "Short step label",
        "explanation": "2-3 sentences explaining what happens at this step and why. Be specific about the code.",
        "highlightEdges": ["source-id->target-id"],
        "duration": 3000,
        "fresherExplanation": "Same explanation but simplified for a fresh graduate. Use an analogy if helpful."
      }
    ],
    "estimatedDuration": 15000
  }
]

Guidelines:
- Generate 3-6 sequences covering the most important flows
- Each sequence should have 3-8 steps
- Categories:
  - "request-flow": HTTP request → processing → response (most common)
  - "data-pipeline": Data ingestion → transformation → storage
  - "auth-flow": Authentication/authorization flows
  - "module-explainer": Deep dive into a single module's internals
- "highlightEdges" is an array of "sourceId->targetId" strings matching architecture edges
- "duration" is milliseconds for the animation pause at each step (2000-5000ms)
- "estimatedDuration" is the sum of all step durations
- "fresherExplanation" should use simple English, analogies, and avoid jargon
- nodeId values MUST match the architecture map node IDs exactly
- Steps should be in logical execution order
- Return ONLY valid JSON. No markdown fences, no explanation text.`;

export const ANIMATED_FLOW_USER_PROMPT = (
  architectureJson: string,
  summary: string
) =>
  `## Architecture Map

Project summary: ${summary}

Architecture map (JSON):
${architectureJson}

Based on this architecture, generate animated walkthrough sequences that would help a new developer understand:
1. The main request flow (how a typical API request is processed)
2. The data pipeline (how data moves through the system)
3. Module-level explainers for the most complex modules

Return the animation sequences as a JSON array.`;

/**
 * Generate a single-node explanation prompt for "click to explain" feature.
 */
export const NODE_EXPLANATION_SYSTEM_PROMPT = `You are a helpful senior developer explaining code to a new team member.
When a developer clicks on a module in the architecture visualization, provide a clear and concise explanation.

Return a JSON object:
{
  "title": "Module Name",
  "summary": "2-3 sentence overview",
  "keyFiles": ["file1.ts", "file2.ts"],
  "responsibilities": ["responsibility 1", "responsibility 2"],
  "connections": [{ "target": "other-module", "relationship": "brief description" }],
  "fresherTip": "A simplified explanation with an analogy for fresh graduates"
}

Return ONLY valid JSON.`;

export const NODE_EXPLANATION_USER_PROMPT = (
  nodeId: string,
  nodeLabel: string,
  nodeDescription: string,
  nodeFiles: string[],
  architectureSummary: string,
  relevantCode: string
) =>
  `## Context
Module: ${nodeLabel} (${nodeId})
Description: ${nodeDescription}
Files: ${nodeFiles.join(", ")}

Project overview: ${architectureSummary}

Relevant source code:
${relevantCode}

Explain this module thoroughly for a developer who's new to the codebase.`;
