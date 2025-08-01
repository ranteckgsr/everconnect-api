@echo off
echo Stopping any existing Node.js processes on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Killing process %%a
    taskkill /PID %%a /F 2>nul
)
timeout /t 2 /nobreak >nul
echo Starting API server...
cd /d "%~dp0"
node server.js