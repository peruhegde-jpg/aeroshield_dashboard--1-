@echo off
title AeroShield Dashboard
echo ========================================================
echo Starting AeroShield Early Warning System Dashboard...
echo ========================================================
cd /d "%~dp0"
start http://localhost:5173
npm.cmd run dev
pause
