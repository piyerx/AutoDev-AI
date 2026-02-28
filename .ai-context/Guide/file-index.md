# File Index — What Every File Does

---

## Project Map

```
your-project/
│
├── 📋 CLAUDE.md                ──→ Claude Code reads this on startup
├── 📋 AGENTS.md                ──→ OpenCode reads this on startup
├── 📋 .cursorrules             ──→ Cursor reads this on startup
├── 📋 .clinerules              ──→ Cline / Roo Code reads this on startup
├── 📝 SPEC.md                  ──→ Planning file — filled by /plan before coding
├── 📖 README.md                ──→ Human docs for GitHub
│
├── 🧠 .ai-context/             ──→ THE BRAIN — all tools read from here
│   ├── prompt_log.md           ──→ Every task tracked with status
│   ├── progress.md             ──→ Project state in plain English
│   ├── checkpoints/
│   │   └── latest.md           ──→ Mid-task save point (/checkpoint writes, /resume reads)
│   ├── sessions/
│   │   └── YYYY-MM-DD.md       ──→ Daily notes (auto-created by /summarize)
│   ├── skills/
│   │   ├── coding-style.md     ──→ Your code standards (read when writing code)
│   │   └── git-commits.md      ──→ Your commit format (read when committing)
│   ├── reference/              ──→ Research dump for planning sessions (create yourself)
│   ├── big-project-approach.md ──→ Guide: milestone approach for big projects
│   ├── skills-guide.md         ──→ Guide: how to find and add external skills
│   ├── memory-and-context.md   ──→ Guide: RAG vs context window, reference material
│   └── file-index.md           ──→ This file
│
├── ⚙️  .claude/
│   ├── settings.json           ──→ Hooks + permissions for Claude Code
│   ├── settings.local.json     ──→ Your personal overrides (not in git)
│   └── commands/
│       ├── plan.md             ──→ Powers /plan command
│       ├── checkpoint.md       ──→ Powers /checkpoint command
│       ├── resume.md           ──→ Powers /resume command
│       ├── status.md           ──→ Powers /status command
│       └── summarize.md        ──→ Powers /summarize command
│
├── 🔷 .antigravity/
│   └── rules.md                ──→ Google Antigravity reads this on startup
│
├── 🐙 .github/
│   └── copilot-instructions.md ──→ GitHub Copilot reads this on startup
│
├── 📁 subfolder-claude-examples/
│   ├── frontend-CLAUDE.md      ──→ Template: copy to frontend/CLAUDE.md
│   └── backend-CLAUDE.md       ──→ Template: copy to backend/CLAUDE.md
│
└── 🔧 scripts/
    ├── setup-ai-context.bat    ──→ Run once to set up a new project
    └── on-file-change.bat      ──→ Auto-logs file changes to activity.log
```

---

## How Tools Connect to the Brain

```
Claude Code ──reads──→ CLAUDE.md ──tells AI to read──→ .ai-context/
OpenCode    ──reads──→ AGENTS.md ──tells AI to read──→ .ai-context/
Cursor      ──reads──→ .cursorrules ──points to──────→ .ai-context/
Cline/Roo   ──reads──→ .clinerules ──points to───────→ .ai-context/
Copilot     ──reads──→ .github/copilot-instructions.md → .ai-context/
Antigravity ──reads──→ .antigravity/rules.md ─────────→ .ai-context/

All tools ──────────────────────────────────────────→ same .ai-context/ brain
```

---

## What Loads When

```
EVERY session (automatic):
  CLAUDE.md / AGENTS.md / .cursorrules / .clinerules   ← tool entry points
  .ai-context/prompt_log.md                             ← task history
  .ai-context/progress.md                               ← project state

ON-DEMAND only (when task matches):
  .ai-context/skills/coding-style.md                    ← when writing code
  .ai-context/skills/git-commits.md                     ← when committing

MANUAL only (you ask for it):
  SPEC.md                                               ← "Read SPEC.md and implement"
  .ai-context/reference/*                               ← during planning sessions
  .ai-context/big-project-approach.md                   ← when starting big project
  .ai-context/checkpoints/latest.md                     ← when you run /resume
```

---

## File Details

### Root Level — Tool Entry Points

| File | Loaded by | Purpose |
|------|-----------|---------|
| `CLAUDE.md` | Claude Code (auto) | Main AI instructions — project name, key files, linting rule. Keep under 20 lines |
| `AGENTS.md` | OpenCode (auto) | Same as CLAUDE.md for OpenCode |
| `.cursorrules` | Cursor (auto) | Same as CLAUDE.md for Cursor |
| `.clinerules` | Cline/Roo Code (auto) | Same as CLAUDE.md for Cline/Roo Code |
| `SPEC.md` | Manual | Planning template — fill before coding any feature |
| `README.md` | Humans / GitHub | Full template docs |

---

### `.ai-context/` — The Brain

| File | Written by | Read by | What it stores |
|------|-----------|---------|---------------|
| `prompt_log.md` | AI (after every task) | Every tool at session start | Task history with ⏳/⚡/✅/❌ status |
| `progress.md` | AI (`/summarize`) | Every tool at session start | Current project state in plain English |
| `checkpoints/latest.md` | AI (`/checkpoint`) | AI (`/resume`) | Exact mid-task position to resume from |
| `sessions/YYYY-MM-DD.md` | AI (`/summarize`) | You (reference) | Daily session notes and file changes |
| `skills/coding-style.md` | You (fill once) | AI (when writing code) | Your code standards and conventions |
| `skills/git-commits.md` | You (fill once) | AI (when committing) | Your commit message format |
| `reference/*` | You (per project) | AI (during planning) | Research, docs, PPTs, competitor analysis |

---

### `.claude/commands/` — Slash Commands

| File | Command | What it does |
|------|---------|-------------|
| `plan.md` | `/plan` | Fills SPEC.md with full plan — NO code |
| `checkpoint.md` | `/checkpoint` | Saves position to checkpoints/latest.md |
| `resume.md` | `/resume` | Reads checkpoint + logs, continues task |
| `status.md` | `/status` | Prints done/in-progress/up-next dashboard |
| `summarize.md` | `/summarize` | Writes session notes, updates progress.md |

---

### Config Files

| File | Used by | Does |
|------|---------|------|
| `.claude/settings.json` | Claude Code | Hook: logs file changes. Permissions: allows writing to .ai-context/ without prompting |
| `.claude/settings.local.json` | You (local only) | Personal overrides — not committed to git |
| `.antigravity/rules.md` | Google Antigravity (auto) | Same as CLAUDE.md for Antigravity |
| `.github/copilot-instructions.md` | GitHub Copilot (auto) | Same as CLAUDE.md for Copilot |

---

### Scripts

| File | When to run | Does |
|------|-------------|------|
| `scripts/setup-ai-context.bat` | Once per new project | Creates .ai-context/ folder structure in your project |
| `scripts/on-file-change.bat` | Auto (via hook) | Logs changed file + timestamp to .ai-context/activity.log |

---

### Subfolder Examples

| File | Copy to | Use for |
|------|---------|---------|
| `subfolder-claude-examples/frontend-CLAUDE.md` | `frontend/CLAUDE.md` | Frontend-specific rules (React, Tailwind, state) |
| `subfolder-claude-examples/backend-CLAUDE.md` | `backend/CLAUDE.md` | Backend-specific rules (API, DB, error handling) |

---

## Rules

```
✅ Fill these yourself (once per project):
   CLAUDE.md, AGENTS.md
   .ai-context/skills/coding-style.md
   .ai-context/skills/git-commits.md

✅ AI fills these automatically:
   .ai-context/prompt_log.md
   .ai-context/checkpoints/latest.md
   .ai-context/sessions/YYYY-MM-DD.md
   .ai-context/progress.md (via /summarize)

✅ You create these per project when needed:
   .ai-context/reference/
   frontend/CLAUDE.md, backend/CLAUDE.md

❌ NEVER edit manually:
   .ai-context/prompt_log.md      ← breaks status tracking
   .ai-context/checkpoints/       ← overwritten each /checkpoint
   .ai-context/sessions/          ← auto-generated
```
