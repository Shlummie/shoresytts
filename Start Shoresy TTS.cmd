@echo off
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo Run Setup Shoresy TTS.cmd first.
  pause
  exit /b 1
)

if not exist "node_modules" call npm install
if errorlevel 1 exit /b 1

call npm run dev:lan
