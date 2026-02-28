# Latest Checkpoint
> Written by AI when quota approaches or /checkpoint is called.
> On resume: read this first, then continue from "Resume From".

**Status:** Milestones 1-3 Complete — Ready for Milestone 4
**Date:** 2025-06-28

---

## Resume From
Milestone 4: Walkthroughs + Conventions. Need to:
1. Create walkthrough generation prompt + endpoint
2. Create convention detection prompt + endpoint
3. Wire GitHub App PR handler for onboarding impact comments
4. Build walkthrough viewer + convention card components
5. Create walkthroughs page in frontend + VS Code panel

## Completed So Far
- **Milestone 1 (Foundation)** — fully done
  - Monorepo root: package.json, pnpm-workspace.yaml, tsconfig.base.json, .gitignore
  - `packages/shared/` — TypeScript types (Repo, User, ArchitectureMap, Walkthrough, Convention, QAResponse)
  - `packages/backend/` — Express API (:3001), routes, services
  - `packages/frontend/` — Next.js 14 (:3000), all pages
  - `packages/github-app/` — Probot app with handlers
  - `packages/vscode-extension/` — Extension with panels + API client
  - `infrastructure/template.yaml` — SAM template
- **Milestone 2 (Core Integration)** — fully done
  - Bedrock two-pass architecture analysis (file tree → key files)
  - S3 code index with "latest" alias + typed analysis output
  - DynamoDB CRUD (getRepoById, updateRepoStatus, listAllRepos)
  - Analysis orchestrator pipeline (S3 → Bedrock → DynamoDB + S3)
  - GitHub App installation/push handlers POST to backend ingest endpoint
  - ArchitectureMap React Flow component (7 node types, auto-layout, legend, minimap)
  - Dashboard with polling, error states, tech stack badges
  - Repo detail page with ArchitectureMap + trigger/retry buttons
  - VS Code CodebaseExplorer with dynamic architecture rendering
- **Milestone 3 (MVP Routes)** — fully done
  - repos.ts — list, get by owner/repo, trigger analysis
  - analysis.ts — get architecture/conventions/walkthroughs, trigger analysis
  - qa.ts — full Q&A pipeline with SHA-256 cache + Bedrock + file references
  - Q&A chat page with related questions, relevant files, auto-scroll
  - VS Code QAPanel with real Bedrock API calls
  - Internal ingest endpoint for GitHub App

## Remaining
- Milestone 4: Walkthroughs + Conventions (Day 4)
- Milestone 5: Polish + Semantic Search (Day 5)
- Milestone 6: Testing + Skill Tracker (Day 6)
- Milestone 7: Demo Day (Day 7)

---
<!-- AI overwrites entire file on each checkpoint -->
