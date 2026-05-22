@echo off
title HCK AI Platform Master Launcher

cd /d "%~dp0"

echo Starting HCK AI Platform from %cd%...
echo.

:: 1. Start Rasa Server in a new window
echo Launching Rasa AI Server (Port 5006)...
start "Rasa AI Server" cmd /k "call .venv310\Scripts\activate && python -m rasa run --enable-api --cors ""*"" --auth-token mysecret123 --port 5006"

:: 2. Start Rasa Action Server
echo Launching Rasa Action Server...
start "Rasa Action Server" cmd /k "call .venv310\Scripts\activate && python -m rasa run actions"

:: 3. Start Frontend & Backend
echo Launching Frontend and Backend...
start "HCK Platform Dev" cmd /k "npm run dev"

:: 4. Wait few seconds before ngrok
timeout /t 8 > nul

:: 5. Start ngrok for frontend
echo Launching ngrok for Frontend...
start "ngrok Frontend" cmd /k "ngrok http 3000"

echo.
echo All systems are launching!
echo You can close this window now.
pause