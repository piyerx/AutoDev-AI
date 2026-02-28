# Project Progress
> Updated by AI at end of every session. Open this to see project state without launching any AI tool.

**Last Updated:** 2026-03-01
**Status:** 🟢 Milestone 4 Complete — Walkthroughs + Conventions + Env Setup Built

---

## ✅ Completed
- Project template initialized
- CLAUDE.md filled with AutoDev project details, tech stack, key files
- SPEC.md created with 7 milestones and definitions of done
- Monorepo scaffolded with pnpm workspaces (5 packages)
- `packages/shared/` — TypeScript types (Repo, User, ArchitectureMap, Walkthrough, Convention, QAResponse)
- `packages/backend/` — Express API on :3001 with route stubs (repos, analysis, qa) + Bedrock/DynamoDB/S3 service clients
- `packages/frontend/` — Next.js 14 on :3000 with landing page, dashboard, repo detail, Q&A chat pages (Tailwind CSS)
- `packages/github-app/` — Probot app with installation, push, PR handlers + repo content fetcher
- `packages/vscode-extension/` — Extension with CodebaseExplorer, QAPanel, API client
- `infrastructure/template.yaml` — AWS SAM template (API Gateway, 3 Lambdas, 4 DynamoDB tables, S3 bucket)
- All packages compile, backend starts on :3001, frontend starts on :3000
- **Milestone 2: Core Integration**
  - `bedrock.ts` — Two-pass architecture analysis (file tree + configs → key source files)
  - `s3.ts` — Code index upload with "latest" alias, typed analysis output retrieval
  - `dynamodb.ts` — getRepoById, updateRepoStatus, listAllRepos
  - `prompts/architecture.ts` — System + two user prompts with JSON schema for 7 node types
  - `analysisOrchestrator.ts` — Full pipeline: S3 fetch → Bedrock two-pass → DynamoDB + S3 store
  - `routes/internal.ts` — POST /api/internal/ingest for GitHub App to push repo files
  - GitHub App handlers (installation.ts, push.ts) wired to fetch repo + POST to backend
  - `ArchitectureMap.tsx` — React Flow component with auto-layout, 7 node types, legend, minimap
  - Dashboard, repo detail, Q&A pages fully wired with real API calls, polling, error states
  - VS Code CodebaseExplorer renders architecture data; QAPanel calls real Bedrock Q&A API
- **Milestone 3: MVP Routes** (completed alongside M2)
  - `repos.ts` — List repos, get by owner/repo, trigger analysis
  - `analysis.ts` — Get architecture/conventions/walkthroughs, trigger analysis
  - `qa.ts` — Full Q&A pipeline with SHA-256 cache + Bedrock + file references
- **Milestone 4: Walkthroughs + Conventions + Env Setup**
  - `prompts/walkthrough.ts` — 4 prompt exports for walkthrough generation
  - `prompts/conventions.ts` — 2 prompt exports for convention detection
  - `prompts/envSetup.ts` — 2 prompt exports for environment analysis
  - `services/envAnalyzer.ts` — File categorizer + Bedrock-powered env setup analyzer
  - `shared/types/analysis.ts` — EnvSetupGuide, SetupStep, SetupConflict, MissingPiece, EnvVariable, DockerSupport types
  - `routes/walkthroughs.ts` — List, generate custom, get by ID
  - `routes/conventions.ts` — List, trigger detection (fire-and-forget)
  - `routes/envSetup.ts` — Get guide, trigger analysis (fire-and-forget)
  - `analysisOrchestrator.ts` — Cascade trigger (conventions + walkthroughs + env-setup after architecture)
  - `pullRequest.ts` — Full onboarding impact comment on PRs
  - `WalkthroughViewer.tsx` — Step viewer with progress, code snippets, navigation
  - `ConventionCard.tsx` — Convention cards with do/don't examples, category grouping
  - `EnvSetupGuide.tsx` — Interactive setup checklist with conflicts, env vars, Docker
  - Frontend pages: walkthroughs, conventions, env-setup (all with sidebar nav)
  - VS Code `WalkthroughPanel.ts` — webview with list, generation, step-by-step navigation
  - Sidebar updated with Conventions + Env Setup links

## 🔄 In Progress
- (none)

## 📋 Up Next
- [ ] Milestone 5: Polish + Semantic Search
- [ ] Milestone 6: Testing + Skill Tracker
- [ ] Milestone 7: Demo Day

---

## 🧠 Key Decisions
- **Product**: AI-powered codebase onboarding (not PR review like CodeRabbit)
- **Name**: AutoDev
- **Monorepo**: pnpm workspaces with 5 packages
- **AI Models**: Bedrock Claude 3.5 Sonnet (analysis), Claude 3 Haiku (Q&A), Titan (embeddings)
- **Two-pass analysis**: Pass 1 scans file tree + configs, Pass 2 reads key files
- **File limits**: 500 files max, 100KB per file, skip binaries/lockfiles
- **Frontend**: Manually scaffolded Next.js 14 (create-next-app had interactive prompt issues)
- **Q&A caching**: SHA-256 hash of (repoId + question) → DynamoDB with 1-hour TTL
- **VS Code config**: `autodev.repoId` setting for repo identification

## ⚠️ Blockers
- [none currently]

## 📁 Important Files
| File | Purpose |
|------|---------|
| CLAUDE.md | AI context — project details and conventions |
| SPEC.md | 7 milestones with definitions of done |
| .ai-context/prompt_log.md | Task history |
| .ai-context/progress.md | This file — project state summary |
| packages/backend/src/index.ts | Express app entry point |
| packages/backend/src/services/ | Bedrock, DynamoDB, S3, analysisOrchestrator |
| packages/backend/src/prompts/ | AI prompts (architecture, walkthrough, conventions, envSetup) |
| packages/backend/src/routes/ | API routes (repos, analysis, qa, internal, walkthroughs, conventions, envSetup) |
| packages/backend/src/services/envAnalyzer.ts | Environment setup analysis service |
| packages/frontend/src/app/ | Next.js pages (dashboard, walkthroughs, conventions, env-setup) |
| packages/frontend/src/components/ | ArchitectureMap, WalkthroughViewer, ConventionCard, EnvSetupGuide |
| packages/github-app/src/ | Probot webhook handlers (installation, push, PR onboarding) |
| packages/vscode-extension/src/ | VS Code extension (CodebaseExplorer, QAPanel, WalkthroughPanel) |
| infrastructure/template.yaml | AWS SAM template |
