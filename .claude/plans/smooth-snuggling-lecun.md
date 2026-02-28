# AutoDev - AI-Powered Codebase Onboarding Platform

## Context

**Problem**: New developers waste 2-4 weeks understanding unfamiliar codebases. No existing tool (CodeRabbit, Greptile, Qodo) focuses on onboarding -- they only review PR diffs, not the full codebase. India has 4.3M developers, 83% of graduates struggle without mentors, and service companies constantly rotate devs across projects.

**Solution**: AutoDev connects to any GitHub repo and instantly generates interactive architecture maps, guided code walkthroughs, convention detection, and natural language Q&A -- turning weeks of onboarding into minutes.

**Hackathon Track**: AI for Learning & Developer Productivity (Student Track)
**Required**: AWS Bedrock + AWS services | **Team**: 4+ members | **Timeline**: 1 week+

---

## Key Differentiators vs. CodeRabbit & Others

| Feature | CodeRabbit | Greptile | AutoDev |
|---------|-----------|----------|---------|
| Scope | PR diffs only | Full repo (review) | Full repo (onboarding) |
| Architecture maps | No | No | Yes (interactive) |
| Guided walkthroughs | No | No | Yes |
| Convention detection | Limited | No | Yes |
| Learning/education | No | No | Yes (skill tracking) |
| VS Code + Web + GitHub | GitHub only | GitHub only | All three |
| India pricing | $24/dev/mo | $50/dev/mo | Free tier |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Node.js + TypeScript + Express (wrapped in Lambda via serverless-http) |
| Frontend | Next.js 14 (App Router, TypeScript) |
| GitHub App | Node.js + Probot framework |
| VS Code Extension | TypeScript + React webviews |
| AI Engine | AWS Bedrock (Claude 3.5 Sonnet for analysis, Claude 3 Haiku for Q&A, Titan Embeddings for search) |
| Database | DynamoDB (users, repos, analysis cache, Q&A cache) |
| Storage | S3 (code indexes, generated outputs, embeddings) |
| API Layer | API Gateway + Lambda |
| Visualization | React Flow (architecture maps) |

---

## Monorepo Structure

```
autodev/
  packages/
    backend/              -- Express API + Lambda handlers
    frontend/             -- Next.js dashboard
    github-app/           -- Probot GitHub App
    vscode-extension/     -- VS Code extension
    shared/               -- Shared TypeScript types
  infrastructure/         -- AWS CDK/SAM templates
  package.json            -- Workspace root (npm/pnpm workspaces)
```

---

## Architecture

```
GitHub (Webhooks/API)
        |
  API Gateway (REST)
        |
  Lambda (Webhook Handler - Probot)
        |
    SQS Queue
        |
  Lambda (Analysis Orchestrator)
        |
   +----+----+
   |         |
Bedrock    S3 (Code Index)
(Claude/Titan)
   |
   +----+----+
   |         |
DynamoDB   Generated Content
(Cache)    (Maps, Walkthroughs)
   |
   +----------+----------+
   |                      |
Next.js Dashboard    VS Code Extension
```

---

## Core Features (5 total)

### 1. Codebase Map Generator
- Fetch repo via GitHub API tree/blob endpoints, store in S3
- Two-pass Bedrock analysis: Pass 1 scans file tree + configs, Pass 2 reads key files
- Output: JSON graph (nodes=modules, edges=dependencies) rendered with React Flow
- Repos up to 500 files; larger repos use sampling strategy

### 2. Interactive Code Walkthroughs
- Pre-generated walkthroughs for common questions (auth, API flow, data models)
- Custom walkthroughs via user questions
- Step-by-step cards with syntax-highlighted code + file references
- In VS Code: opens actual files and highlights relevant lines

### 3. Team Convention Detector
- Samples multiple files of same type, identifies patterns via Bedrock
- Outputs convention cards with category, pattern name, examples, confidence score
- Covers: architecture patterns, error handling, naming, testing patterns

### 4. Smart Q&A
- Embed code chunks using Bedrock Titan Embeddings
- Cosine similarity search to find relevant files
- Question + relevant files + architecture context sent to Bedrock Claude
- Response cached in DynamoDB with TTL

### 5. Developer Skill Tracker (Bonus)
- Track walkthroughs completed, modules explored, questions asked
- Progress dashboard with radar chart per module
- "You've explored 60% of the auth module"

---

## DynamoDB Tables

| Table | PK | SK | Purpose |
|---|---|---|---|
| autodev-users | userId | - | Profiles, GitHub tokens, settings |
| autodev-repos | repoId | userId | Repo configs, analysis status, tech stack |
| autodev-analysis | repoId | analysisType#version | Architecture maps, conventions, walkthroughs |
| autodev-qa-cache | repoId | questionHash | Cached Q&A responses with TTL |
| autodev-skill-tracker | userId#repoId | moduleId | Learning progress per developer |

---

## Team Split (4 Members)

### Member A: Backend + AWS Infrastructure
- AWS CDK/SAM setup (API Gateway, Lambda, DynamoDB, S3)
- Bedrock integration (analysis prompts, embeddings, Q&A)
- Express API endpoints
- Caching and optimization

### Member B: GitHub App + Webhook System
- Probot GitHub App setup and registration
- Repo content fetcher (GitHub API)
- Webhook handlers (installation, push, PR events)
- PR "Onboarding Impact" comments

### Member C: Frontend Dashboard (Next.js)
- NextAuth.js with GitHub OAuth
- Architecture map page (React Flow)
- Walkthrough viewer, convention cards, Q&A chat
- Skill tracker dashboard, landing page

### Member D: VS Code Extension + Demo
- Extension scaffold with webview panels
- Codebase explorer, Q&A chat, walkthrough panels
- CodeLens inline annotations
- Demo video recording, presentation slides, sample repos

---

## Day-by-Day Timeline

### Day 1: Foundation
- **A**: Deploy AWS stack (API Gateway, Lambda, DynamoDB, S3). Express skeleton running locally.
- **B**: GitHub App registered, webhooks receiving. Installation handler stores repo metadata.
- **C**: Next.js scaffolded, GitHub OAuth working, dashboard layout, repo list page.
- **D**: Extension scaffolded, webview panel opens, API client module created.
- **Milestone**: All 4 components exist and run independently.

### Day 2: Core Integration
- **A**: Bedrock integration working (prompt -> structured analysis). S3 upload/download working.
- **B**: Full repo fetcher working (files land in S3). Push event triggers re-fetch.
- **C**: React Flow rendering architecture map from JSON. Repo detail page layout.
- **D**: React app in webview. Architecture map rendering in extension.
- **Milestone**: Bedrock produces analysis. GitHub fetches real code. UI renders maps.

### Day 3: MVP Complete
- **A**: End-to-end analysis orchestrator. Q&A endpoint working with Bedrock.
- **B**: Full flow: install app -> webhook -> analysis -> data in DynamoDB.
- **C**: Real data from backend on map page and Q&A page.
- **D**: Extension connected to real backend. Map + Q&A working.
- **Milestone**: **MVP DONE.** Connect repo, see architecture, ask questions. Works on web + VS Code.

### Day 4: Walkthroughs + Conventions
- **A**: Walkthrough generation endpoint. Convention detection. Pre-generate standard walkthroughs.
- **B**: PR handler posts "Onboarding Impact" comments with module context.
- **C**: Walkthrough viewer with syntax highlighting. Convention cards page.
- **D**: Walkthrough panel opens files and highlights lines. CodeLens prototype.
- **Milestone**: Walkthroughs and conventions working. PR comments posting.

### Day 5: Polish + Semantic Search
- **A**: Embedding pipeline (Titan). Semantic search for Q&A. Response caching. Prompt optimization.
- **B**: Incremental analysis (only changed files). Webhook reliability.
- **C**: Interactive map (click/hover/zoom). Dashboard stats. Responsive design.
- **D**: CodeLens on functions. Hover tooltips. Command palette commands.
- **Milestone**: All features polished. Semantic search improves Q&A.

### Day 6: Testing + Skill Tracker
- **A**: Skill tracker API. Load testing. Integration testing. Bug fixes.
- **B**: Test with 5+ real repos. Fix edge cases. API documentation.
- **C**: Skill tracker page (radar chart). Landing page polish. Cross-browser testing.
- **D**: Test across repo types. Fix webview issues. Extension marketplace prep.
- **Milestone**: All features on real repos. Skill tracker done. Edge cases handled.

### Day 7: Demo Day
- **All AM**: Final integration testing, bug fixes.
- **A**: Stable AWS infra, "reset" script for demo data.
- **B**: 2-3 pre-analyzed sample repos ready.
- **C**: Final UI polish, compelling landing page.
- **D**: Backup demo video recorded, slides done, demo rehearsed.
- **Milestone**: **Demo-ready.** Rehearsed, video backup, sample repos prepared.

---

## Demo Script (3-5 minutes)

1. **Problem** (30s): "New devs waste weeks understanding codebases. No tool solves onboarding."
2. **Install** (30s): Install AutoDev on a sample repo, analysis triggers.
3. **Architecture Map** (45s): Interactive map, click nodes, see file details.
4. **Walkthrough** (45s): "How does auth work?" -- step-by-step guided tour.
5. **Conventions** (30s): Detected patterns with examples.
6. **Q&A** (30s): "Where is the payment logic?" -- instant answer with file refs.
7. **VS Code** (30s): Same features inline in the editor.
8. **Impact** (30s): "4.3M Indian developers. AutoDev bridges the mentoring gap."

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Bedrock rate limits during demo | Pre-analyze demo repos, cache responses, static fallback data |
| Large repos too slow | Hard limit 500 files for MVP, sampling for larger repos |
| Demo failure | Record backup video Day 6, pre-cached offline data |
| AWS costs | Stay in free tier (DynamoDB on-demand, Lambda free tier) |

---

## Amazon Q Integration (Bonus Points)

1. Use Amazon Q Developer while building AutoDev (mention in presentation)
2. Add "Amazon Q Suggestions" section in convention detector
3. Dedicate one slide to "Built with AWS" (Bedrock + Lambda + S3 + DynamoDB + Q)

---

## Verification / Testing Plan

1. **Unit**: Test Bedrock prompt parsing, GitHub API fetching, DynamoDB CRUD
2. **Integration**: End-to-end flow -- install GitHub App on test repo, verify analysis completes, verify map renders
3. **Manual**: Test with 3 repos (small JS project, medium Python project, large TS monorepo)
4. **Demo rehearsal**: Full demo run-through on Day 6, record backup video
5. **VS Code**: Test extension install from VSIX on clean VS Code instance

---

## Files to Modify First

1. `CLAUDE.md` -- Update with AutoDev project name, tech stack, key files
2. `SPEC.md` -- Fill with milestone breakdown from this plan
3. `.ai-context/skills/coding-style.md` -- TypeScript conventions for the team
4. `.ai-context/prompt_log.md` -- Log first task as PENDING
