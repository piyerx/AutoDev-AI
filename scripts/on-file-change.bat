@echo off
REM on-file-change.bat
REM Runs automatically after Claude writes/edits any file
REM Appends to a simple activity log

set TIMESTAMP=%date% %time%
set LOGFILE=.ai-context\activity.log

echo [%TIMESTAMP%] FILE CHANGED: %CLAUDE_TOOL_INPUT% >> %LOGFILE% 2>&1

exit /b 0
