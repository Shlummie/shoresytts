@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js 22 or newer, then run this again.
  pause
  exit /b 1
)

call npm install
if errorlevel 1 goto :failed

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup-tts.ps1"
if errorlevel 1 goto :failed

echo.
echo Shoresy TTS is ready. Run Start Shoresy TTS.cmd.
pause
exit /b 0

:failed
echo.
echo Setup failed. Review the error above.
pause
exit /b 1
