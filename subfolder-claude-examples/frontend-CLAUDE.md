# Frontend Context
> This file adds frontend-specific rules on top of root CLAUDE.md.

## Stack
React 18, TypeScript strict, Tailwind CSS, Zustand for state.

## Rules (frontend only)
- Functional components only — no class components
- All components must have TypeScript props interface
- Use Tailwind utilities only — no inline styles
- State: local useState first, Zustand only if 2+ components need it

## Linter
Run `npm run lint` before finishing any frontend task.
