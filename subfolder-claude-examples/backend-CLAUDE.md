# Backend Context
> This file adds backend-specific rules on top of root CLAUDE.md.

## Stack
FastAPI, Python 3.11+, SQLAlchemy, Alembic for migrations.

## Rules (backend only)
- Always add input validation with Pydantic models
- Never write raw SQL — use SQLAlchemy ORM
- Always use Alembic for schema changes — never modify DB directly
- Every endpoint needs error handling with HTTPException

## Linter
Run `ruff check .` before finishing any backend task.
