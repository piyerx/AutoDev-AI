# Project Progress
> Updated by AI at end of every session. Open this to see project state without launching any AI tool.

**Last Updated:** 2026-02-28
**Status:** 🟢 Milestone 1 Complete — Foundation Built

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

## 🔄 In Progress
- [ ] Milestone 2: Core Integration (wire Bedrock, connect GitHub App to S3, React Flow maps, VS Code webviews)

## 📋 Up Next
- [ ] Milestone 3: MVP End-to-End (install app → analysis → map + Q&A working)
- [ ] Milestone 4: Walkthroughs + Conventions
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
| packages/backend/src/services/ | Bedrock, DynamoDB, S3 clients |
| packages/frontend/src/app/ | Next.js pages |
| packages/github-app/src/ | Probot webhook handlers |
| packages/vscode-extension/src/ | VS Code extension |
| infrastructure/template.yaml | AWS SAM template |
