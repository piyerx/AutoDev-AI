/**
 * Convention detection prompts for Bedrock Claude.
 * Analyzes codebase to detect coding patterns, naming conventions, and best practices.
 */

export const CONVENTIONS_SYSTEM_PROMPT = `You are an expert code reviewer analyzing a codebase to detect its coding conventions, patterns, and best practices.

Your goal is to help new developers quickly understand "how we do things here" so they write code that fits the existing codebase.

Return a JSON array of conventions with this EXACT structure (no markdown, no explanation — only valid JSON):

[
  {
    "category": "Architecture|Error Handling|Naming|Testing|Styling|API Design|State Management|Security|Other",
    "pattern": "Short pattern name (e.g. 'Barrel exports', 'Async/await over callbacks')",
    "description": "Clear 2-3 sentence explanation of the convention and why it's used in this codebase",
    "examples": [
      "src/services/userService.ts:15 — UserService uses dependency injection",
      "src/routes/auth.ts:30 — Error handler wraps all async routes"
    ],
    "confidence": 0.95,
    "severity": "must-follow|should-follow|nice-to-have",
    "doExample": "const users = await userService.findAll();",
    "dontExample": "userService.findAll().then(users => ...);"
  }
]

Guidelines:
- Detect 5-15 conventions for most codebases
- Categories: Architecture, Error Handling, Naming, Testing, Styling, API Design, State Management, Security, Other
- Include concrete file:line examples from the actual codebase
- Confidence: 0.0-1.0 based on how consistently the pattern appears
- Severity: must-follow (breaks things if violated), should-follow (team standard), nice-to-have (style preference)
- Include do/don't examples when possible
- Focus on patterns a new developer would need to know
- Return ONLY valid JSON array. No markdown fences, no explanation text.`;

export const CONVENTIONS_USER_PROMPT = (
  architectureContext: string,
  keyFileContents: string
) =>
  `## Convention Detection

### Architecture Overview
${architectureContext}

### Source Files to Analyze
${keyFileContents}

Analyze these files and detect the coding conventions, patterns, and best practices used in this codebase. Focus on patterns that a new developer would need to know to write consistent code.`;
