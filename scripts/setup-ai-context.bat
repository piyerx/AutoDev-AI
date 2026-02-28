@echo off
REM setup-ai-context.bat v2
REM Run in any new project to initialize the universal AI context system
REM Usage: setup-ai-context.bat "My Project Name"

set PROJECT_NAME=%~1
if "%PROJECT_NAME%"=="" (
    set /p PROJECT_NAME="Enter project name: "
)

echo.
echo ================================================
echo  Universal AI Context Setup v2
echo  Project: %PROJECT_NAME%
echo ================================================
echo.

REM Where this template lives — change this path to where YOU saved the template
set TEMPLATE=%USERPROFILE%\ai-project-template-v2

REM ── Folders ──────────────────────────────────────
echo [1/7] Creating folders...
mkdir .ai-context\sessions 2>nul
mkdir .ai-context\checkpoints 2>nul
mkdir .ai-context\skills 2>nul
mkdir .claude\commands 2>nul
mkdir .github 2>nul
mkdir scripts 2>nul

REM ── Root AI config files ──────────────────────────
echo [2/7] Copying AI config files...
copy "%TEMPLATE%\CLAUDE.md" "CLAUDE.md" >nul
copy "%TEMPLATE%\AGENTS.md" "AGENTS.md" >nul
copy "%TEMPLATE%\.cursorrules" ".cursorrules" >nul
copy "%TEMPLATE%\.github\copilot-instructions.md" ".github\copilot-instructions.md" >nul

REM ── .ai-context tracking files ────────────────────
echo [3/7] Copying context tracking files...
copy "%TEMPLATE%\.ai-context\prompt_log.md" ".ai-context\prompt_log.md" >nul
copy "%TEMPLATE%\.ai-context\progress.md" ".ai-context\progress.md" >nul
copy "%TEMPLATE%\.ai-context\checkpoints\latest.md" ".ai-context\checkpoints\latest.md" >nul
copy "%TEMPLATE%\.ai-context\skills\coding-style.md" ".ai-context\skills\coding-style.md" >nul
copy "%TEMPLATE%\.ai-context\skills\git-commits.md" ".ai-context\skills\git-commits.md" >nul

REM ── .claude config ────────────────────────────────
echo [4/7] Copying Claude Code config...
copy "%TEMPLATE%\.claude\settings.json" ".claude\settings.json" >nul
copy "%TEMPLATE%\.claude\commands\checkpoint.md" ".claude\commands\checkpoint.md" >nul
copy "%TEMPLATE%\.claude\commands\resume.md" ".claude\commands\resume.md" >nul
copy "%TEMPLATE%\.claude\commands\summarize.md" ".claude\commands\summarize.md" >nul
copy "%TEMPLATE%\.claude\commands\status.md" ".claude\commands\status.md" >nul
copy "%TEMPLATE%\.claude\commands\plan.md" ".claude\commands\plan.md" >nul

REM ── Scripts ───────────────────────────────────────
echo [5/7] Copying hook scripts...
copy "%TEMPLATE%\scripts\on-file-change.bat" "scripts\on-file-change.bat" >nul

REM ── SPEC.md planning template ─────────────────────
echo [6/7] Copying planning template...
copy "%TEMPLATE%\SPEC.md" "SPEC.md" >nul

REM ── Inject project name ───────────────────────────
echo [7/7] Setting project name...
powershell -Command "(Get-Content CLAUDE.md) -replace '\[PROJECT NAME\]', '%PROJECT_NAME%' | Set-Content CLAUDE.md"
powershell -Command "(Get-Content AGENTS.md) -replace '\[PROJECT NAME\]', '%PROJECT_NAME%' | Set-Content AGENTS.md"

echo.
echo ================================================
echo  ✅ Done! "%PROJECT_NAME%" is ready.
echo ================================================
echo.
echo NOW DO THIS:
echo  1. Open CLAUDE.md → fill in purpose, tech stack, key files
echo  2. Open .ai-context\skills\coding-style.md → add your code preferences
echo  3. Open Claude Code in this folder
echo.
echo COMMANDS AVAILABLE IN CLAUDE CODE:
echo  /plan       → plan a task before coding (keeps context clean)
echo  /checkpoint → save progress mid-task
echo  /resume     → continue last incomplete task
echo  /status     → see project state
echo  /summarize  → end of session summary
echo.
echo BUILT-IN CLAUDE CODE COMMANDS (terminal):
echo  claude --resume    → restore last session
echo  claude --continue  → continue most recent session
echo  /clear             → wipe context between tasks
echo  /context           → check token usage (run every 30 min)
echo.
pause
