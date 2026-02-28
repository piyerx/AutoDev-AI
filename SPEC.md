# SPEC.md — AutoDev Task Specification
> AI-powered codebase onboarding platform for the AI for Learning & Developer Productivity hackathon.

---

## Task
Build AutoDev — a platform that connects to GitHub repos and generates interactive architecture maps, guided code walkthroughs, convention detection, and natural language Q&A to onboard new developers in minutes instead of weeks.

## Why
- New developers waste 2-4 weeks understanding unfamiliar codebases
- No existing tool (CodeRabbit, Greptile, Qodo) focuses on onboarding — they only review PR diffs
- India has 4.3M developers; 83% of graduates struggle without mentors
- Service companies constantly rotate devs across projects — onboarding is a massive bottleneck

---

## Milestone 1: Foundation (Day 1)

### Files to Create
- [x] `package.json` — pnpm workspace root
- [x] `pnpm-workspace.yaml` — workspace config
- [x] `tsconfig.base.json` — shared TypeScript config
- [x] `packages/shared/package.json` — shared types package
- [x] `packages/shared/src/index.ts` — type exports
- [x] `packages/shared/src/types/repo.ts` — repo/analysis types
- [x] `packages/shared/src/types/user.ts` — user types
- [x] `packages/shared/src/types/analysis.ts` — analysis result types
- [x] `packages/backend/package.json` — backend package
- [x] `packages/backend/src/index.ts` — Express app entry
- [x] `packages/backend/src/routes/` — API route stubs
- [x] `packages/frontend/` — Next.js 14 app (manually scaffolded)
- [x] `packages/github-app/package.json` — Probot app
- [x] `packages/github-app/src/index.ts` — webhook handler entry
- [x] `packages/vscode-extension/package.json` — VS Code extension manifest
- [x] `packages/vscode-extension/src/extension.ts` — extension entry
- [x] `infrastructure/template.yaml` — AWS SAM template

### Definition of Done — Milestone 1
- [x] All 5 packages exist and compile independently
- [x] `pnpm install` works from root
- [x] Backend runs locally on port 3001
- [x] Frontend runs locally on port 3000
- [x] GitHub App receives test webhooks
- [x] VS Code extension activates with "Hello World" panel
- [x] AWS SAM template defines API Gateway + Lambda + DynamoDB + S3

---

## Milestone 2: Core Integration (Day 2)

### Files to Create/Modify
- [x] `packages/backend/src/services/bedrock.ts` — Bedrock client wrapper
- [x] `packages/backend/src/services/s3.ts` — S3 operations
- [x] `packages/backend/src/services/dynamodb.ts` — DynamoDB operations
- [x] `packages/backend/src/prompts/architecture.ts` — architecture analysis prompt
- [x] `packages/github-app/src/handlers/installation.ts` — app installation handler
- [x] `packages/github-app/src/services/repoFetcher.ts` — fetch repo contents via GitHub API
- [x] `packages/frontend/src/app/dashboard/page.tsx` — dashboard with repo list
- [x] `packages/frontend/src/components/ArchitectureMap.tsx` — React Flow component
- [x] `packages/vscode-extension/src/panels/CodebaseExplorer.ts` — webview panel

### Definition of Done — Milestone 2
- [x] Bedrock returns structured architecture analysis from code files
- [x] GitHub App fetches repo files into S3 on installation
- [x] Frontend renders architecture map from JSON data
- [x] VS Code extension renders architecture map in webview

---

## Milestone 3: MVP End-to-End (Day 3)

### Files to Create/Modify
- [x] `packages/backend/src/routes/repos.ts` — repo CRUD endpoints
- [x] `packages/backend/src/routes/analysis.ts` — trigger/get analysis
- [x] `packages/backend/src/routes/qa.ts` — Q&A endpoint
- [x] `packages/backend/src/services/analysisOrchestrator.ts` — coordinates analysis pipeline
- [x] `packages/frontend/src/app/dashboard/[repoId]/page.tsx` — repo detail page
- [x] `packages/frontend/src/app/dashboard/[repoId]/qa/page.tsx` — Q&A chat page
- [ ] `packages/frontend/src/components/QAChat.tsx` — chat interface (inline in Q&A page)
- [x] `packages/vscode-extension/src/panels/QAPanel.ts` — Q&A in VS Code

### Definition of Done — Milestone 3 (MVP)
- [x] Install GitHub App on repo → analysis runs automatically
- [x] Architecture map visible on web dashboard
- [x] Q&A works: ask question → get answer with file references
- [x] VS Code extension shows map + Q&A
- [ ] **End-to-end demo possible** (needs AWS credentials + deployed infra)

---

## Milestone 4: Walkthroughs + Conventions (Day 4)

### Files to Create/Modify
- [ ] `packages/backend/src/prompts/walkthrough.ts` — walkthrough generation prompt
- [ ] `packages/backend/src/prompts/conventions.ts` — convention detection prompt
- [ ] `packages/backend/src/routes/walkthroughs.ts` — walkthrough endpoints
- [ ] `packages/backend/src/routes/conventions.ts` — convention endpoints
- [ ] `packages/github-app/src/handlers/pullRequest.ts` — PR onboarding impact comments
- [ ] `packages/frontend/src/app/dashboard/[repoId]/walkthroughs/page.tsx` — walkthrough list
- [ ] `packages/frontend/src/components/WalkthroughViewer.tsx` — step-by-step viewer
- [ ] `packages/frontend/src/components/ConventionCard.tsx` — convention cards
- [ ] `packages/vscode-extension/src/panels/WalkthroughPanel.ts` — walkthrough in VS Code

### Definition of Done — Milestone 4
- [ ] Pre-generated walkthroughs appear after analysis
- [ ] Custom walkthroughs from user questions
- [ ] Convention cards display detected patterns
- [ ] PR comments show onboarding impact

---

## Milestone 5: Polish + Semantic Search (Day 5)

### Files to Create/Modify
- [ ] `packages/backend/src/services/embeddings.ts` — Titan embedding pipeline
- [ ] `packages/backend/src/services/semanticSearch.ts` — cosine similarity search
- [ ] `packages/backend/src/services/cache.ts` — DynamoDB caching with TTL
- [ ] `packages/frontend/src/components/InteractiveMap.tsx` — enhanced React Flow with hover/click
- [ ] `packages/vscode-extension/src/providers/CodeLensProvider.ts` — inline annotations

### Definition of Done — Milestone 5
- [ ] Q&A uses semantic search for better file retrieval
- [ ] Responses cached in DynamoDB
- [ ] Architecture map is interactive (zoom, click, hover)
- [ ] VS Code has CodeLens annotations

---

## Milestone 6: Testing + Skill Tracker (Day 6)

### Files to Create/Modify
- [ ] `packages/backend/src/routes/skillTracker.ts` — skill tracking endpoints
- [ ] `packages/frontend/src/app/dashboard/[repoId]/team/page.tsx` — skill tracker page
- [ ] `packages/frontend/src/components/SkillRadar.tsx` — radar chart component

### Definition of Done — Milestone 6
- [ ] Tested with 5+ real repos of varying sizes
- [ ] Skill tracker shows per-developer progress
- [ ] Edge cases handled (large repos, empty repos, non-code repos)
- [ ] All features working end-to-end

---

## Milestone 7: Demo Day (Day 7)

### Definition of Done — Milestone 7
- [ ] 2-3 sample repos pre-analyzed for demo
- [ ] Backup demo video recorded
- [ ] Presentation slides completed
- [ ] Demo script rehearsed (3-5 minutes)
- [ ] Landing page polished
- [ ] AWS infra stable with no cold-start issues during demo

---

## Edge Cases to Handle
- [ ] Repos with 500+ files (use sampling strategy)
- [ ] Empty repositories
- [ ] Non-code repos (docs, configs only)
- [ ] GitHub API rate limits (use installation tokens, cache aggressively)
- [ ] Bedrock token limits (multi-pass analysis, chunking)
- [ ] Private repos (proper auth token handling)
- [ ] Binary files (skip in analysis)

---
<!-- Implementation plan reference: .claude/plans/smooth-snuggling-lecun.md -->
