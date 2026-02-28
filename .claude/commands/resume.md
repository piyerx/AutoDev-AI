# /resume
# Continue from last incomplete task. Use when switching tools or after quota reset.

Do this in order:
1. Read .ai-context/prompt_log.md — find latest PENDING ⏳ or IN-PROGRESS ⚡ task
2. Read .ai-context/checkpoints/latest.md — get exact resume point
3. Read .ai-context/progress.md — understand overall project state

Then tell the user:
```
📍 Resuming from:
   Task: [task description]
   Resume point: [exact file/section/line]
   Remaining: [what still needs doing]
```

Then continue immediately — no need to ask for confirmation.

Note: If no PENDING/IN-PROGRESS task exists, tell user "No incomplete tasks found. All caught up!"
