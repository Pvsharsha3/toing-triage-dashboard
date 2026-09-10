@echo off
cd /d "%~dp0"

echo Building frontend...
cd frontend
call npm install --silent
call npm run build
cd ..

echo Starting Toing Triage Dashboard...
cd backend
pip install -r requirements.txt -q

:: Open browser after 2 seconds
start "" timeout /t 2 /nobreak >nul & start "" "http://localhost:8000"

:: Start server (first run will open Snowflake SSO in browser)
python -m uvicorn main:app --host 0.0.0.0 --port 8000
