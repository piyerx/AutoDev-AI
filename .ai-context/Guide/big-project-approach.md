# How to Approach Building a Big Project with AI

## The Problem With "One Big Prompt"

Your old approach (one giant prompt → Claude builds everything → fix issues) works for small projects. For something like CodeRabbit clone, it breaks down because:

- Claude hits token limits mid-build and stops or hallucinates
- You get 80% done then it forgets what it already built
- Features conflict with each other because no upfront architecture
- You can't tell what's done vs broken

---

## The Right Approach for a Big Project

Think of it like **3 phases**, not one big prompt.

---

### Phase 1: Architecture Planning (One Session, No Code)

First, understand what CodeRabbit actually does. It's an AI code review tool. So you need:
- GitHub/GitLab webhook integration
- PR diff parsing
- AI analysis (calling LLM APIs)
- Comment posting back to PRs
- Dashboard UI

**Do this:**
```
/plan Build a CodeRabbit clone — AI-powered code review tool.
GitHub webhooks receive PR events, parse diffs, send to LLM for review,
post comments back to PR. Include a web dashboard to see review history.
Tech stack: Next.js, TypeScript, PostgreSQL, GitHub API.
```

Claude fills SPEC.md with the full plan. **No code yet.**

---

### Phase 2: Break SPEC.md Into Milestones

After `/plan`, you'll have a SPEC.md. Manually split it into milestones — this is the most important step you do yourself:

```
Milestone 1: Project setup + database schema
Milestone 2: GitHub webhook receiver
Milestone 3: PR diff parser
Milestone 4: LLM review engine
Milestone 5: GitHub comment poster
Milestone 6: Web dashboard
Milestone 7: Auth + deployment
```

Write these into .ai-context/progress.md under "Up Next".

---

### Phase 3: Build One Milestone Per Session

One milestone = one or more sessions. A complex milestone (like "LLM Review Engine")
can span 2-3 sessions due to quota. Use /checkpoint and /resume within it.

Each session follows this pattern:

```
Session 1:
→ "Read SPEC.md and progress.md. Build Milestone 1: project setup and database schema only."
→ Claude builds it
→ /clear between sub-tasks inside the milestone (prevents context bleed)
→ At 70% tokens → /checkpoint
→ After quota reset → /resume
→ When milestone done → you test it manually

TESTING GATE (do not skip):
→ ✅ M1 passes → /summarize → update progress.md → /clear → start M2
→ ❌ M1 fails  → fix M1 → retest → THEN start M2
   Never start the next milestone on a broken previous one.

Session 2:
→ Claude auto-reads prompt_log.md → sees M1 COMPLETED
→ "Build Milestone 2: GitHub webhook receiver"
→ etc.
```

**After every completed milestone — do this before starting the next:**
```
/summarize
→ update .ai-context/progress.md:
   ✅ M1 complete
   🔄 M2 is next: [brief description]
/clear
→ fresh session for next milestone
```

---

## What Files You Need to Create Upfront

For a CodeRabbit clone specifically, before you even open Claude Code, write these two files yourself (or have another AI help write them):

### CLAUDE.md — fill it in:
```markdown
# CodeRabbit Clone
AI-powered code review tool. Next.js + TypeScript + PostgreSQL + GitHub API.
Reviews PRs automatically and posts AI-generated code review comments.

## On Session Start
Read .ai-context/prompt_log.md → resume PENDING task.
Read .ai-context/progress.md → understand current milestone.

## Key Files
- src/app/ → Next.js pages + API routes
- src/lib/github.ts → GitHub API client
- src/lib/review.ts → LLM review engine
- prisma/schema.prisma → database schema
- src/webhooks/ → GitHub webhook handlers

## Linting
Run `npm run lint` before finishing any task.
```

### SPEC.md — the full technical plan:

(Manually split SPEC.md into milestones yourself — correct. Don't let Claude decide milestone boundaries. You decide. Claude builds.)

You can generate this by asking ChatGPT or another Claude session:
```
"Write a detailed SPEC.md for building a CodeRabbit clone.
Include: database schema, API routes, file structure,
GitHub webhook flow, LLM integration, dashboard pages.
Format it as a technical specification."
```

Paste the output into SPEC.md. Then `/clear`.

---

## Your New Workflow vs Your Old Workflow

| Your old way | New way |
|---|---|
| One giant prompt → build everything | Plan first → build one milestone per session |
| Claude forgets context mid-build | prompt_log.md tracks every step |
| Fix issues randomly | Test each milestone before moving on |
| Start over if Claude breaks | `/checkpoint` saves position, `/resume` continues |
| One tool only | Switch Claude/OpenCode/Cursor freely |

---

## Practical First Steps for Any Big Project

**Today — 30 minutes:**
1. Copy this template into a new folder `your-project/`
2. Run `scripts/setup-ai-context.bat "Your Project Name"`
3. Ask ChatGPT to generate a detailed SPEC.md for your project
4. Paste output into SPEC.md
5. Fill in CLAUDE.md (short version — under 20 lines)

**First Claude Code session:**
```
Read SPEC.md and CLAUDE.md.
Build Milestone 1 only: project setup, folder structure, and database schema.
Do not build any other milestones yet.
```

That's it. Claude builds M1. You test it. Then next session → M2.
You never lose context, you never get a half-built mess,
and you can switch tools anytime.

---

## Slash Commands — What Each One Does

These are custom commands built into this template (inside `.claude/commands/`).
Type them in Claude Code at any point during your work.

---

### `/plan [describe what to build]`
**Use before any non-trivial task — always.**

What it does:
- Thinks through the full implementation
- Fills `SPEC.md` with: files to create, functions needed, edge cases, order of steps, definition of done
- Does NOT write any code — planning only

After it finishes it tells you:
```
1. Review SPEC.md — edit anything wrong
2. /clear  ← start fresh coding session
3. "Read SPEC.md and implement it"
```

Why: Planning context and coding context must be separate.
If you plan and code in the same session, old planning tokens pollute the build.

---

### `/checkpoint`
**Use at 70%+ token usage, or before any long/risky task.**

What it does:
- Saves your exact position to `.ai-context/checkpoints/latest.md`
- Records: what task is in progress, what's done so far, what's remaining, exact file/line to resume from
- Updates `prompt_log.md` to IN-PROGRESS status

After saving it confirms:
```
"Checkpoint saved. Resume anytime with /resume or claude --resume in terminal."
```

Why: If quota runs out mid-task, you don't lose your place.
You can resume in a new session or a different tool (Cline, OpenCode, etc).

---

### `/resume`
**Use after quota reset, after tool switch, or at the start of any new session.**

What it does:
1. Reads `prompt_log.md` → finds latest PENDING or IN-PROGRESS task
2. Reads `checkpoints/latest.md` → gets exact resume point
3. Reads `progress.md` → understands overall project state
4. Tells you exactly where it's resuming from, then continues immediately

Output looks like:
```
📍 Resuming from:
   Task: Build GitHub webhook receiver
   Resume point: src/webhooks/github.ts line 45
   Remaining: error handling + tests
```

Why: Zero re-explanation needed. The AI picks up exactly where it stopped.

---

### `/status`
**Use anytime — quick snapshot of where the project stands.**

What it does:
- Reads `progress.md` and last 5 entries from `prompt_log.md`
- Prints a clean dashboard:

```
📊 PROJECT STATUS
──────────────────────────
✅ Recently Done:
  • M1: project setup + DB schema

⚡ In Progress:
  • M2: GitHub webhook receiver

📋 Up Next:
  • M3: PR diff parser

⚠️  Blockers: none
💡 Tip: Run /context to check token usage
```

Why: Good to run at the start of a session before asking Claude to do anything.
Instantly orients the AI (and you) on the current state.

---

### `/summarize`
**Use at the end of every session — always.**

What it does:
1. Reads today's completed tasks from `prompt_log.md`
2. Reads `activity.log` (which files changed)
3. Writes a session summary to `.ai-context/sessions/YYYY-MM-DD.md`
4. Updates `progress.md` — moves done items to ✅, updates In Progress and Up Next

Session file looks like:
```
# Session — 2026-02-28

## Completed
- M1 project setup: created prisma schema, Next.js config, env setup

## Files Changed
- prisma/schema.prisma: added users, repos, reviews tables

## Next Session
- M2: GitHub webhook receiver
```

Why: This is what lets you (or any AI tool) open the project days later
and instantly know what was built and what's next.

---

### `/clear` (built-in Claude Code — not a custom command)
**Use between every task — the most important habit.**

What it does: Wipes the current conversation context completely.

Why: Old context from task A bleeds into task B and causes:
- AI referencing wrong files
- Contradicting decisions it made earlier
- Slower responses (carrying dead weight tokens)

Rule: One task = one context window. Always `/clear` between tasks.

---

## Command Usage At a Glance

| When | Command |
|---|---|
| Before starting any feature | `/plan` |
| At session start | `/status` then `/resume` if needed |
| Every 20-30 min | `/context` (check token %) |
| At 70% tokens | `/checkpoint` |
| Between tasks | `/clear` |
| After quota reset or tool switch | `/resume` |
| End of every session | `/summarize` |

---

## Key Insight

**Claude is a great builder but a bad planner under pressure.**
You do the planning (with AI help), Claude does the building, one chunk at a time.

---

## When Does `big-project-approach.md` Load?

**It does NOT auto-load every session.** Here's how the full loading system works:

| File | When it loads | How |
|---|---|---|
| `CLAUDE.md` | Every session, automatically | Claude Code reads it on startup |
| `.ai-context/prompt_log.md` | Every session start | CLAUDE.md tells AI to read it |
| `.ai-context/progress.md` | Every session start | CLAUDE.md tells AI to read it |
| `.ai-context/skills/coding-style.md` | Only when writing code | CLAUDE.md says "on-demand only" |
| `.ai-context/skills/git-commits.md` | Only when committing | CLAUDE.md says "on-demand only" |
| `.ai-context/big-project-approach.md` | **Never — manual only** | Not mentioned anywhere |
| `SPEC.md` | Only when you say "Read SPEC.md" | Manual |
| `checkpoints/latest.md` | Only when you run `/resume` | Command reads it |

### What this file actually is

It's a **reference guide for you** — not for the AI to read every session.

Use it in two situations:

**1. Starting a brand new big project:**
```
"Read .ai-context/big-project-approach.md and help me set up
this project following that workflow."
```

**2. When you forget the workflow** — open it in your editor and read it yourself.

### Why it shouldn't auto-load

`CLAUDE.md` is intentionally kept under 20 lines. If this file loaded every session,
it would burn ~300 tokens on a guide you don't need for routine tasks like fixing a bug.

The rule in this template:
- **Always load** → only what the AI needs every single session (CLAUDE.md + prompt_log + progress)
- **On-demand** → everything else, only when relevant

That's what keeps the AI fast and focused.
