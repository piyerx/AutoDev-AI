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

## Milestone 4: Walkthroughs + Conventions + Environment Setup Autopilot (Day 4)

### Files to Create/Modify
- [x] `packages/backend/src/prompts/walkthrough.ts` — walkthrough generation prompt
- [x] `packages/backend/src/prompts/conventions.ts` — convention detection prompt
- [x] `packages/backend/src/prompts/envSetup.ts` — environment setup analysis prompt
- [x] `packages/backend/src/routes/walkthroughs.ts` — walkthrough endpoints
- [x] `packages/backend/src/routes/conventions.ts` — convention endpoints
- [x] `packages/backend/src/routes/envSetup.ts` — environment setup endpoints
- [x] `packages/backend/src/services/envAnalyzer.ts` — scans repo for setup requirements (.nvmrc, Dockerfile, docker-compose.yml, .env.example, package.json engines, Makefile)
- [x] `packages/github-app/src/handlers/pullRequest.ts` — PR onboarding impact comments
- [x] `packages/frontend/src/app/dashboard/[repoId]/walkthroughs/page.tsx` — walkthrough list
- [x] `packages/frontend/src/components/WalkthroughViewer.tsx` — step-by-step viewer
- [x] `packages/frontend/src/components/ConventionCard.tsx` — convention cards
- [x] `packages/frontend/src/components/EnvSetupGuide.tsx` — environment setup checklist with conflict warnings
- [x] `packages/vscode-extension/src/panels/WalkthroughPanel.ts` — walkthrough in VS Code

### Definition of Done — Milestone 4
- [x] Pre-generated walkthroughs appear after analysis
- [x] Custom walkthroughs from user questions
- [x] Convention cards display detected patterns
- [x] PR comments show onboarding impact
- [x] Environment Setup Autopilot: AI scans repo → generates verified step-by-step setup guide
- [x] Flags conflicts (e.g. "README says Node 16 but package.json needs Node 18")
- [x] Detects missing setup pieces (e.g. "Repo uses Redis but no Redis setup docs found")
- [x] Setup guide visible on dashboard and VS Code extension

---

## Milestone 5: Animated Visual Walkthroughs + Multi-Language Support (Day 5)

### Files to Create/Modify
- [ ] `packages/backend/src/services/embeddings.ts` — Titan embedding pipeline
- [ ] `packages/backend/src/services/semanticSearch.ts` — cosine similarity search
- [ ] `packages/backend/src/services/cache.ts` — DynamoDB caching with TTL
- [ ] `packages/backend/src/services/i18n.ts` — multi-language explanation service (Bedrock prompt wrapper for Hindi, Tamil, Telugu, Kannada, Bengali, Marathi)
- [ ] `packages/backend/src/prompts/animatedFlow.ts` — prompt to generate step-by-step node sequences for animated walkthroughs
- [ ] `packages/frontend/src/components/AnimatedArchitectureMap.tsx` — React Flow with animated node-by-node highlighting, auto-play, pause-on-click
- [ ] `packages/frontend/src/components/LanguageSelector.tsx` — language picker (English, Hindi, Tamil, Telugu, Kannada, Bengali, Marathi)
- [ ] `packages/frontend/src/app/dashboard/[repoId]/animated/page.tsx` — animated walkthrough page
- [ ] `packages/vscode-extension/src/providers/CodeLensProvider.ts` — inline annotations

### Definition of Done — Milestone 5
- [ ] Q&A uses semantic search for better file retrieval
- [ ] Responses cached in DynamoDB
- [ ] **Animated Visual Walkthroughs**: nodes light up in sequence showing request flow (e.g. User → API Gateway → Auth → DB → Response)
- [ ] Click any node mid-animation → pause and get AI explanation
- [ ] Per-module animated explainers: "Frontend Layer", "Auth System", "Data Pipeline"
- [ ] Animation sequences auto-generated from codebase analysis
- [ ] **Multi-Language Support**: Q&A and walkthroughs available in Hindi, Tamil, Telugu, Kannada, Bengali, Marathi
- [ ] Language selector on dashboard and VS Code extension
- [ ] "Explain like I'm a fresher" mode in any supported language
- [ ] VS Code has CodeLens annotations

---

## Milestone 6: Learning Progress Dashboard + Skill Tracker (Day 6)

### Files to Create/Modify
- [ ] `packages/backend/src/routes/skillTracker.ts` — skill/progress tracking endpoints
- [ ] `packages/backend/src/services/progressTracker.ts` — tracks modules explored, Q&A asked, walkthroughs completed, time spent per area
- [ ] `packages/frontend/src/app/dashboard/[repoId]/progress/page.tsx` — learning progress dashboard
- [ ] `packages/frontend/src/components/SkillRadar.tsx` — radar chart (Auth, API, DB, Frontend, Infra, etc.)
- [ ] `packages/frontend/src/components/ProgressTimeline.tsx` — "0% → 80% understanding" visual timeline
- [ ] `packages/frontend/src/components/ModuleCompletionGrid.tsx` — grid showing completed vs remaining modules
- [ ] `packages/frontend/src/app/dashboard/[repoId]/team/page.tsx` — team-level progress view

### Definition of Done — Milestone 6
- [ ] **Learning Progress Dashboard**: shows per-developer codebase understanding percentage
- [ ] Skill radar charts: visual breakdown per module (Auth 70%, API 40%, DB 90%)
- [ ] Progress timeline: "Developer went from 0% to 80% in 2 hours"
- [ ] Module completion tracking: walkthroughs viewed, Q&As asked, areas explored
- [ ] Team view: compare onboarding progress across developers
- [ ] Tested with 3+ real repos of varying sizes
- [ ] Edge cases handled (large repos, empty repos, non-code repos)
- [ ] All features working end-to-end

---

## Milestone 7: Demo Day (Day 7)

### Demo Script (3-minute video pitch)
> "A fresher joins a company. In 10 minutes: animated system map, AI explanations in their language, verified setup guide, and a learning path. 2 weeks → 2 hours."

1. Install GitHub App on repo → auto-analysis starts
2. **Animated architecture map** lights up showing the system flow
3. AI Mentor answers "explain auth like I'm a fresher" — **in Hindi**
4. **Environment Setup Autopilot**: "8 steps detected, 2 conflicts found"
5. **Progress dashboard**: "Understanding: 0% → 45% in 10 minutes"

### Key Demo Talking Points
- **"Learning" not "Doing"**: Every competitor helps devs DO work. AutoDev helps devs LEARN.
- **Measurable outcomes**: Progress dashboard shows quantifiable learning (0% → 80%)
- **Bharat-specific**: Hindi/Tamil/Telugu explanations — no Silicon Valley tool does this
- **The full pipeline**: GitHub install → auto-analyze → animated map + setup guide + Q&A + progress tracking

### Definition of Done — Milestone 7
- [ ] 2-3 sample repos pre-analyzed for demo
- [ ] Backup demo video recorded (3 minutes max)
- [ ] Demo showcases all 4 winning features: Animated Map, Setup Autopilot, Multi-Language, Progress Dashboard
- [ ] Hindi language demo moment captured
- [ ] Presentation slides completed
- [ ] Demo script rehearsed
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
- [ ] Multi-language fallback (if Bedrock response quality is poor in a language, fall back to English with disclaimer)
- [ ] Repos with no setup files (generate best-guess setup from package.json/requirements.txt)

---
<!-- Implementation plan reference: .claude/plans/smooth-snuggling-lecun.md -->
