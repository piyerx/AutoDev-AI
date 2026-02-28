# Skills Guide — How to Find and Use External Skills

## How Skills Work in This Template

Skills are just **markdown files** in `.ai-context/skills/`. You tell the AI to read them only when relevant — not every session.

The template already has two empty ones:
- `skills/coding-style.md` — your code preferences
- `skills/git-commits.md` — commit format

You can add any skill file from anywhere — GitHub, your own writing, community repos.

---

## How to Add a Skill From GitHub

**Step 1:** Find the skill file on GitHub (raw content)

**Step 2:** Download it into your skills folder:
```
.ai-context/skills/ui-building.md
.ai-context/skills/production-ready.md
.ai-context/skills/nextjs-patterns.md
```

**Step 3:** Register it in `CLAUDE.md` so the AI knows it exists:
```markdown
## Skills
Read .ai-context/skills/ files on-demand only:
- skills/coding-style.md → when writing code
- skills/git-commits.md → when committing
- skills/ui-building.md → when building UI components
- skills/production-ready.md → when setting up auth, error handling, deployment
```

**Step 4:** The AI reads it automatically when the task matches — or trigger it manually:
```
"Read .ai-context/skills/ui-building.md then build the dashboard page"
```

---

## Where to Find Community Skills

There's no single official registry yet, but good places to look:

| Source | What to search |
|---|---|
| GitHub | `claude skills coding` or `claude code instructions` or `CLAUDE.md template` |
| GitHub | `llm instructions ui nextjs` |
| Cursor community | `.cursorrules` files — these work as skills too, same format |

One well-known resource is cursor.directory — it has hundreds of `.cursorrules` files
for different stacks (Next.js, React, FastAPI, etc). Download any of them, rename to `.md`,
and drop into your `skills/` folder. They work identically.

---

## Practical Example — Adding a Next.js UI Skill

Say you found a good Next.js + Tailwind skill file on GitHub. Here's the full flow:

**1. Save it:**
```
.ai-context/skills/nextjs-tailwind.md
```

**2. Add to CLAUDE.md:**
```markdown
## Skills
- skills/coding-style.md → when writing code
- skills/git-commits.md → when committing
- skills/nextjs-tailwind.md → when building Next.js pages or components
```

**3. Use it:**
```
"Read SPEC.md and skills/nextjs-tailwind.md, then build the dashboard UI"
```

Claude reads the skill file first, then codes following those exact patterns.

---

## Write Your Own Skills

If Claude keeps making the same mistakes on your project, write a skill file yourself:

```markdown
# UI Building Rules

## Component Pattern
Always use shadcn/ui components. Never raw HTML divs for layout.

## Styling
Tailwind only. No inline styles. No CSS modules.

## State
Use Zustand for global state. useState only for local UI state.

## Do NOT
- Use default exports for components
- Put business logic inside components
- Use `any` type in TypeScript
```

Save as `skills/ui-rules.md`, register in CLAUDE.md — done.
Now every time you build UI, Claude follows your exact rules without you repeating them.

---

## Skills Are NOT Auto-Loaded

Skills only load when the task matches or you explicitly say to read them.
This keeps context lean. Never put a skill in CLAUDE.md as "always load" —
that defeats the purpose and wastes tokens every session.

| Load type | Example |
|---|---|
| Auto (task match) | Writing code → Claude reads `coding-style.md` |
| Manual trigger | `"Read skills/nextjs-tailwind.md then build X"` |
| Never | Just sitting in the folder — ignored until needed |
