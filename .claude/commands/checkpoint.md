# /checkpoint
# Manually save progress mid-task. Use before long tasks or when context feels heavy.

Check current token usage with /context first, then write to .ai-context/checkpoints/latest.md:

```
# Latest Checkpoint
**Task:** [what is currently in progress]
**Status:** IN-PROGRESS ⚡
**Saved:** [timestamp]

## Resume From
[exact instruction needed to continue — be specific about file, line, section]

## Completed So Far
- [item with file:line reference if possible]

## Remaining
- [item]
- [item]
```

Then update .ai-context/prompt_log.md — change current task status to IN-PROGRESS ⚡ and add:
`**Checkpoint saved:** see .ai-context/checkpoints/latest.md`

Confirm to user: "Checkpoint saved. Resume anytime with /resume or claude --resume in terminal."
