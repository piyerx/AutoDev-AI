# /summarize
# Run at end of session. Saves daily summary and updates progress.md

1. Read .ai-context/prompt_log.md — collect today's completed tasks
2. Read .ai-context/activity.log if it exists — see which files changed

3. Write .ai-context/sessions/[YYYY-MM-DD].md:
```markdown
# Session — [DATE]

## Completed
- [task]: [what changed, which files]

## Incomplete
- [task]: [resume from X]

## Files Changed
- [file]: [summary of change]

## Next Session
- [top priority]
```

4. Update .ai-context/progress.md:
   - Move completed items to ✅ Completed
   - Update 🔄 In Progress
   - Update 📋 Up Next

5. Confirm: "Session saved to .ai-context/sessions/[DATE].md — see you next time!"
