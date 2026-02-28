# Git Commits
> Read this ONLY when making commits — not every session.

## Format
```
type(scope): short description

[optional body — what and why, not how]
```

## Types
- feat → new feature
- fix → bug fix
- refactor → code change, no feature/fix
- docs → documentation only
- test → adding tests
- chore → build, config, dependencies

## Rules
- Subject line max 72 characters
- Use present tense ("add feature" not "added feature")
- Reference issue numbers if applicable: "fix(auth): handle expired tokens (#142)"

## Examples
```
feat(auth): add Google OAuth login
fix(cart): prevent duplicate items on rapid clicks
refactor(api): extract user validation to service layer
```
