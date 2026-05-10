@echo off
title HCK AI Platform Master Launcher
cd /d "%~dp0"
echo Starting HCK AI Platform from %cd%...
echo.

:: 1. Start Rasa Server in a new window
echo Launching Rasa AI Server (Port 5006)...
start "Rasa AI Server" cmd /k "call .venv310\Scripts\activate && python -m rasa run --enable-api --cors ""*"" --auth-token mysecret123 --port 5006"

:: 2. Start Rasa Action Server (Port 5055)
echo Launching Rasa Action Server...
start "Rasa Action Server" cmd /k "call .venv310\Scripts\activate && python -m rasa run actions"

:: 2. Start Frontend & Backend in a new window
echo Launching Frontend and Backend...
start "HCK Platform Dev" cmd /k "npm run dev"

echo.
echo All systems are launching! 
echo You can close this window now.
pause
