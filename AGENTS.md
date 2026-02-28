# AutoDev — Agent Context
AI-powered codebase onboarding platform. Node.js/TypeScript monorepo (pnpm workspaces) with Express backend, Next.js frontend, Probot GitHub App, VS Code extension, AWS Bedrock + Lambda + DynamoDB + S3.

## On Session Start
Read .ai-context/prompt_log.md → find PENDING or IN-PROGRESS task → resume it.
Read .ai-context/progress.md → understand current project state.
Read .ai-context/checkpoints/latest.md → see exact resume point.

## Every Task
1. Log to .ai-context/prompt_log.md as PENDING before starting
2. Update to COMPLETED with change summary when done
3. If interrupted → mark IN-PROGRESS with exact resume instruction

## Skills
skills/ folder has project standards. Read on-demand:
- skills/coding-style.md → when writing code
- skills/git-commits.md → when committing

## Key References
- CLAUDE.md → full project details, tech stack, key files
- SPEC.md → 7 milestones with definitions of done and file lists
- .claude/plans/smooth-snuggling-lecun.md → full implementation plan with architecture, team split, day-by-day timeline

## Full Context
See CLAUDE.md for complete project details.
