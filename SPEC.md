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
- [ ] GitHub App receives test webhooks
- [ ] VS Code extension activates with "Hello World" panel
- [x] AWS SAM template defines API Gateway + Lambda + DynamoDB + S3

---

## Milestone 2: Core Integration (Day 2)

### Files to Create/Modify
- [ ] `packages/backend/src/services/bedrock.ts` — Bedrock client wrapper
- [ ] `packages/backend/src/services/s3.ts` — S3 operations
- [ ] `packages/backend/src/services/dynamodb.ts` — DynamoDB operations
- [ ] `packages/backend/src/prompts/architecture.ts` — architecture analysis prompt
- [ ] `packages/github-app/src/handlers/installation.ts` — app installation handler
- [ ] `packages/github-app/src/services/repoFetcher.ts` — fetch repo contents via GitHub API
- [ ] `packages/frontend/src/app/dashboard/page.tsx` — dashboard with repo list
- [ ] `packages/frontend/src/components/ArchitectureMap.tsx` — React Flow component
- [ ] `packages/vscode-extension/src/panels/CodebaseExplorer.ts` — webview panel

### Definition of Done — Milestone 2
- [ ] Bedrock returns structured architecture analysis from code files
- [ ] GitHub App fetches repo files into S3 on installation
- [ ] Frontend renders architecture map from JSON data
- [ ] VS Code extension renders architecture map in webview

---

## Milestone 3: MVP End-to-End (Day 3)

### Files to Create/Modify
- [ ] `packages/backend/src/routes/repos.ts` — repo CRUD endpoints
- [ ] `packages/backend/src/routes/analysis.ts` — trigger/get analysis
- [ ] `packages/backend/src/routes/qa.ts` — Q&A endpoint
- [ ] `packages/backend/src/services/analysisOrchestrator.ts` — coordinates analysis pipeline
- [ ] `packages/frontend/src/app/dashboard/[repoId]/page.tsx` — repo detail page
- [ ] `packages/frontend/src/app/dashboard/[repoId]/qa/page.tsx` — Q&A chat page
- [ ] `packages/frontend/src/components/QAChat.tsx` — chat interface
- [ ] `packages/vscode-extension/src/panels/QAPanel.ts` — Q&A in VS Code

### Definition of Done — Milestone 3 (MVP)
- [ ] Install GitHub App on repo → analysis runs automatically
- [ ] Architecture map visible on web dashboard
- [ ] Q&A works: ask question → get answer with file references
- [ ] VS Code extension shows map + Q&A
- [ ] **End-to-end demo possible**

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
