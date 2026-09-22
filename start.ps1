# METEORA Master Startup Script for PowerShell
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  METEORA Cyclone Platform Direct Launcher" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

Write-Host "`n[1/2] Starting React Vite Frontend on http://localhost:5173/..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir\frontend_source'; npm run dev"

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173/"

Write-Host "`n[2/2] Starting Django REST & ML Server on http://127.0.0.1:8000/..." -ForegroundColor Green
Write-Host "----------------------------------------------------" -ForegroundColor Gray
Write-Host " React Frontend:  http://localhost:5173/" -ForegroundColor Cyan
Write-Host " Django Backend:  http://127.0.0.1:8000/" -ForegroundColor Cyan
Write-Host "----------------------------------------------------`n" -ForegroundColor Gray

python manage.py runserver 0.0.0.0:8000
