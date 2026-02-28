# Memory, Context & Reference Material Guide

## Do You Need RAG?

**No — not for your development workflow.**

Claude Sonnet 4.6 has a 200,000 token context window. That's roughly:
- 150,000 words
- ~500 pages of text
- Your entire codebase + docs + reference material all at once

RAG exists to work around small context windows (GPT-3 had 4k tokens).
Claude's window is large enough that for most projects, you just paste everything in directly.

---

## The Planning Session Approach

For a big project (like building a CodeRabbit-style tool for AIforBharat hackathon),
create one dedicated planning session where you dump ALL reference material:

```
"I'm building an AI code review tool better than CodeRabbit for
AIforBharat hackathon using complete AWS services.

Here's all my reference material — read everything before planning:

1. Read .ai-context/reference/hackathon-requirements.md
2. Read .ai-context/reference/coderabbit-docs.md
3. Read .ai-context/reference/aws-architecture.md
4. Read .ai-context/reference/our-ppt-summary.md
5. Read .ai-context/reference/reddit-insights.md
6. Read .ai-context/reference/competitor-analysis.md

Now create a complete SPEC.md for our project. Include AWS architecture,
milestones, database schema, API design, and what makes us better than CodeRabbit."
```

Claude reads all of it in one shot → plans the whole thing → writes SPEC.md.
Then `/clear` — planning context gone, but SPEC.md has everything captured.

---

## Reference Folder Structure

Create a `reference/` folder inside `.ai-context/`:

```
.ai-context/
├── reference/
│   ├── hackathon-requirements.md   ← paste from hackathon link
│   ├── coderabbit-docs.md          ← key parts from CodeRabbit docs
│   ├── our-ppt-summary.md          ← summarize your PPT as text
│   ├── reddit-insights.md          ← useful Reddit threads
│   ├── aws-services.md             ← AWS services you'll use
│   └── competitor-analysis.md      ← what CodeRabbit does wrong / gaps
```

Register in `CLAUDE.md` so the AI knows it exists:
```markdown
## Reference Docs (read only during planning sessions)
- .ai-context/reference/ → full project context, load when planning
```

---

## How to Convert Your Materials to Markdown

| You have | How to convert |
|---|---|
| Hackathon website link | Copy the page text, paste into `.md` |
| PPT / slides file | Ask ChatGPT "summarize this PPT as markdown bullet points" |
| CodeRabbit docs pages | Copy key sections, paste into `.md` |
| Reddit posts / threads | Copy paste the useful content |
| PDF document | Upload to Claude.ai — "summarize this as markdown" |
| YouTube video | Use transcript, paste key points |

---

## What About RAG in Your Product?

If you're building CodeRabbit-style functionality, your **product itself** needs
to understand codebases. That's where RAG comes in — but in your app, not your workflow.

AWS options for RAG inside your product:

| AWS Service | What it does |
|---|---|
| **Amazon Bedrock Knowledge Bases** | Fully managed RAG — upload docs/code, query them |
| **Amazon OpenSearch** | Vector search for code embeddings |
| **Amazon S3 + Bedrock** | Store repo files, retrieve relevant chunks for review |
| **Amazon Bedrock + Claude** | Send retrieved code chunks to Claude for review |

For CodeRabbit-style PR review, the architecture would be:
```
GitHub PR opened
      ↓
Fetch PR diff (changed files)
      ↓
Chunk the code changes
      ↓
Send to Bedrock Knowledge Base (or directly to Claude)
      ↓
Claude reviews with context
      ↓
Post comments back to PR
```

---

## Summary — What to Use When

| Situation | Approach |
|---|---|
| Planning a new big project | Dump all reference material into one planning session |
| Daily development work | Template context files (CLAUDE.md + prompt_log + progress) |
| Forgot something mid-build | Reference folder — "Read .ai-context/reference/X.md" |
| Building RAG into your product | AWS Bedrock Knowledge Bases |
| Context window getting full | /checkpoint → /clear → /resume |

---

## Bottom Line

- **Your workflow**: No RAG needed. Use the reference folder + big planning session.
- **Your product**: Yes, use AWS Bedrock for code understanding.
- **The template**: Already supports reference material — just add a `reference/` folder.
