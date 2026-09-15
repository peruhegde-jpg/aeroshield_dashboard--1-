@echo off
echo ===================================================
echo   AEROSHIELD: Dual Full-Stack Launcher (P5 + P6)
echo ===================================================
echo Starting Person 5 FastAPI Backend on port 8000...
start cmd /k "python -m uvicorn backend.main:app --port 8000 --host 0.0.0.0"

echo Starting Person 6 Dashboard UI on port 5173...
start cmd /k "npm.cmd run dev -- --host --port 5173"

echo Opening browser at http://localhost:5173...
timeout /t 3 /nobreak > nul
start http://localhost:5173

echo ===================================================
echo   AeroShield is now RUNNING!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo ===================================================
pause
