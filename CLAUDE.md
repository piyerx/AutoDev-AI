# AutoDev
AI-powered codebase onboarding platform. Node.js/TypeScript monorepo with Next.js frontend, Express backend, Probot GitHub App, VS Code extension, AWS Bedrock + Lambda + DynamoDB + S3.

## On Session Start
Read .ai-context/prompt_log.md → find any PENDING or IN-PROGRESS task → resume it.

## Every Task
1. Log prompt to .ai-context/prompt_log.md as PENDING before starting
2. Update to COMPLETED with change summary when done
3. If interrupted → mark IN-PROGRESS, write resume note

## Skills
Read skills/ files on-demand only — not every session:
- skills/coding-style.md → when writing code
- skills/git-commits.md → when committing
- Add more as needed

## Tech Stack
- **Backend**: Node.js + TypeScript + Express (Lambda via serverless-http)
- **Frontend**: Next.js 14 (App Router, TypeScript)
- **GitHub App**: Probot framework
- **VS Code Extension**: TypeScript + React webviews
- **AI**: AWS Bedrock (Claude 3.5 Sonnet, Claude 3 Haiku, Titan Embeddings)
- **Database**: DynamoDB
- **Storage**: S3
- **API Layer**: API Gateway + Lambda
- **Visualization**: React Flow

## Key Files
- `packages/backend/` — Express API + Lambda handlers
- `packages/frontend/` — Next.js dashboard
- `packages/github-app/` — Probot GitHub App
- `packages/vscode-extension/` — VS Code extension
- `packages/shared/` — Shared TypeScript types
- `infrastructure/` — AWS CDK/SAM templates
- `SPEC.md` — Task specification and milestones

## Linting
Always run the linter before finishing any code task.
- `pnpm lint` from root runs all packages
- Each package has its own `lint` script
