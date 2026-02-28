# Universal AI Context Template v2
> Works with Claude Code, OpenCode, Cursor, Cline, GitHub Copilot, and Google Antigravity.
> Survives quota resets, tool switches, and context limits.
> One brain. Every tool. Zero lost context.

---

## What Tools This Covers

| Tool | File it auto-reads |
|------|-------------------|
| Claude Code (terminal) | `CLAUDE.md` |
| OpenCode | `AGENTS.md` |
| Cursor | `.cursorrules` |
| Cline / Roo Code (VS Code) | `.clinerules` |
| GitHub Copilot (VS Code) | `.github/copilot-instructions.md` |
| Google Antigravity | `.antigravity/rules.md` |

All tools read the same `.ai-context/` brain. Switch anytime, zero context lost.

---

## What's Inside

```
your-project/
│
├── CLAUDE.md                        ← Claude Code auto-loads (KEEP SHORT)
├── AGENTS.md                        ← OpenCode auto-loads
├── .cursorrules                     ← Cursor auto-loads
├── .clinerules                      ← Cline / Roo Code auto-loads
├── SPEC.md                          ← planning template (fill before coding)
│
├── .ai-context/                     ← THE BRAIN
│   ├── prompt_log.md                ← every task tracked (PENDING/IN-PROGRESS/COMPLETED)
│   ├── progress.md                  ← project state in plain English
│   ├── activity.log                 ← auto-filled by hook on every file change
│   ├── checkpoints/
│   │   └── latest.md                ← mid-task saves
│   ├── sessions/
│   │   └── YYYY-MM-DD.md            ← daily summaries
│   ├── skills/
│   │   ├── coding-style.md          ← your code preferences (read on-demand)
│   │   └── git-commits.md           ← commit format (read on-demand)
│   ├── reference/                   ← dump research, docs, PPTs here for planning
│   ├── big-project-approach.md      ← guide for building big projects milestone by milestone
│   ├── skills-guide.md              ← how to find and use external skills
│   └── memory-and-context.md        ← RAG, reference material, planning sessions guide
│
├── .claude/
│   ├── settings.json                ← hooks config
│   └── commands/
│       ├── plan.md                  ← /plan
│       ├── checkpoint.md            ← /checkpoint
│       ├── resume.md                ← /resume
│       ├── status.md                ← /status
│       └── summarize.md             ← /summarize
│
├── .antigravity/
│   └── rules.md                     ← Google Antigravity auto-loads
│
├── .github/
│   └── copilot-instructions.md      ← GitHub Copilot (VS Code) auto-loads
│
├── subfolder-claude-examples/       ← copy these into frontend/, backend/ etc
│   ├── frontend-CLAUDE.md
│   └── backend-CLAUDE.md
│
└── scripts/
    ├── setup-ai-context.bat         ← run in any new project
    └── on-file-change.bat           ← auto hook (runs after every file write)
```

---

## Setup (First Time)

```bat
REM 1. Save this template to:
C:\Users\YourName\ai-project-template-v2

REM 2. Go to your new project
cd C:\path\to\your\project

REM 3. Run setup
C:\Users\YourName\ai-project-template-v2\scripts\setup-ai-context.bat "My Project"

REM 4. Fill in CLAUDE.md (takes 2 minutes)
REM 5. Open Claude Code — it auto-loads everything
```

---

## Daily Workflow

### Starting a session
```
Claude Code      → just open it, CLAUDE.md auto-loads
OpenCode         → AGENTS.md auto-loads
Cursor           → .cursorrules auto-loads
Cline / Roo Code → .clinerules auto-loads
GitHub Copilot   → .github/copilot-instructions.md auto-loads
Google Antigravity → .antigravity/rules.md auto-loads

Any tool fallback → "Read CLAUDE.md, .ai-context/prompt_log.md,
                     .ai-context/progress.md — resume any pending task."
```

### Between tasks — IMPORTANT
```
/clear    ← do this between every task
           prevents old context bleeding into new task
           one of the most impactful habits you can build
```

### Before a big task — plan first
```
/plan build user authentication system
  → Claude fills SPEC.md with full plan, no code
  → you review SPEC.md, adjust if needed
  → /clear
  → "Read SPEC.md and implement it"
  → clean focused coding session
```

### Monitor token usage
```
/context  ← run every 20-30 minutes
           at 70%+ → run /checkpoint
           at 85%+ → wrap task, /clear, fresh session
```

### Quota hits mid-task
```
Before it hits → /checkpoint saves your exact position
After reset    → claude --resume  (built-in, restores session)
                 OR open new session → /resume (reads checkpoint file)
```

### Switching tools mid-project
```
1. /checkpoint  in current tool
2. Open new tool in same project folder
3. "Read CLAUDE.md and .ai-context/prompt_log.md then resume"
4. Continues exactly where you left off
```

### End of session
```
/summarize  → saves .ai-context/sessions/YYYY-MM-DD.md
              updates progress.md
              done
```

---

## Customizing CLAUDE.md (the most important step)

Keep it SHORT — under 20 lines. Fill in only these parts:

```markdown
# My E-Commerce App
Next.js 14 + TypeScript + Prisma + PostgreSQL. Selling handmade jewelry.

## On Session Start
Read .ai-context/prompt_log.md → resume any PENDING task.
Read .ai-context/progress.md → understand current state.

## Every Task
1. Log to .ai-context/prompt_log.md as PENDING before starting
2. Update to COMPLETED with change summary when done

## Skills
Read skills/ files on-demand only:
- skills/coding-style.md → when writing code
- skills/git-commits.md → when committing

## Key Files
- src/app/ → Next.js pages
- src/components/ → React components
- prisma/schema.prisma → database schema
- src/lib/ → utilities and API clients

## Linting
Run `npm run lint` before finishing any code task.
```

---

## For Big Projects — Milestone Approach

See `.ai-context/big-project-approach.md` for the full guide. Short version:

```
1. /plan [describe full project]  → fills SPEC.md, no code
2. Manually split SPEC.md into milestones (you decide, not Claude)
3. Write milestones into .ai-context/progress.md
4. /clear
5. Each session: build ONE milestone only
6. Test milestone → pass? → /summarize → /clear → next milestone
               → fail? → fix → retest → THEN next milestone
7. Never start M2 on a broken M1
```

---

## Reference Material for Planning

Create `.ai-context/reference/` and dump all your research there:
```
.ai-context/reference/
├── hackathon-requirements.md   ← paste from event page
├── competitor-analysis.md      ← what existing tools do wrong
├── our-ppt-summary.md          ← summarize your PPT as text
└── tech-decisions.md           ← AWS services, stack choices
```

Then in your planning session:
```
"Read all files in .ai-context/reference/ then write a complete SPEC.md"
```

---

## Commands Reference

| Command | When to use |
|---------|-------------|
| `/plan` | Before any non-trivial task — plan first, code second |
| `/checkpoint` | At 70%+ token usage, or before risky long task |
| `/resume` | After quota reset or tool switch |
| `/status` | Anytime — quick project overview |
| `/summarize` | End of every session |
| `/clear` | Between every task (built-in, not custom) |
| `/context` | Every 20-30 min to monitor token usage |
| `claude --resume` | Terminal command to restore last session natively |

---

## Key Habits (the short list)

1. `/clear` between tasks — always
2. `/plan` before big tasks — always
3. `/context` every 30 min — always
4. `/checkpoint` at 70% tokens — always
5. `/summarize` end of session — always

Five habits. Everything else is automatic.

---

## Subfolder CLAUDE.md (for bigger projects)

Place a `CLAUDE.md` inside each major subfolder for folder-specific rules:

```
my-project/
├── CLAUDE.md              ← global rules
├── frontend/
│   └── CLAUDE.md          ← React/Tailwind rules only
├── backend/
│   └── CLAUDE.md          ← FastAPI/SQLAlchemy rules only
└── database/
    └── CLAUDE.md          ← migration rules only
```

Copy from `subfolder-claude-examples/` and edit to fit.

---

## What's New in This Version (Community Improvements)

| Original v2 | This version |
|-------------|-------------|
| Covered 3 tools | Covers 6 tools (+ Cline, Copilot, Antigravity) |
| No .clinerules | `.clinerules` added for Cline/Roo Code |
| Minimal copilot instructions | Full instructions in copilot-instructions.md |
| No Antigravity support | `.antigravity/rules.md` added |
| No big project guide | `.ai-context/big-project-approach.md` added |
| No skills guide | `.ai-context/skills-guide.md` added |
| No RAG/memory guide | `.ai-context/memory-and-context.md` added |
| No reference/ folder concept | `.ai-context/reference/` pattern documented |
