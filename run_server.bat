@echo off
title METEORA Cyclone Intelligence Platform - Master Startup
color 0A
echo ===================================================
echo   METEORA Satellite Cyclone Platform Master Launcher
echo ===================================================
echo.

cd /d "%~dp0"
echo Working Directory: %CD%
echo.

set PYTHON_CMD=

:: Check if 'python' is in PATH
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 set PYTHON_CMD=python

:: Check if 'py' launcher is in PATH
if "%PYTHON_CMD%"=="" (
    where py >nul 2>nul
    if %ERRORLEVEL% EQU 0 set PYTHON_CMD=py
)

:: Search common Windows Python installation directories
if "%PYTHON_CMD%"=="" (
    echo Searching system for Python installations...
    for /d %%D in ("%LOCALAPPDATA%\Programs\Python\Python*") do (
        if exist "%%D\python.exe" set PYTHON_CMD="%%D\python.exe"
    )
)

if "%PYTHON_CMD%"=="" (
    for /d %%D in ("C:\Python*") do (
        if exist "%%D\python.exe" set PYTHON_CMD="%%D\python.exe"
    )
)

if "%PYTHON_CMD%"=="" (
    for /d %%D in ("%ProgramFiles%\Python*") do (
        if exist "%%D\python.exe" set PYTHON_CMD="%%D\python.exe"
    )
)

if "%PYTHON_CMD%"=="" (
    if exist "%USERPROFILE%\anaconda3\python.exe" set PYTHON_CMD="%USERPROFILE%\anaconda3\python.exe"
    if exist "%USERPROFILE%\miniconda3\python.exe" set PYTHON_CMD="%USERPROFILE%\miniconda3\python.exe"
    if exist "C:\ProgramData\anaconda3\python.exe" set PYTHON_CMD="C:\ProgramData\anaconda3\python.exe"
    if exist "C:\ProgramData\miniconda3\python.exe" set PYTHON_CMD="C:\ProgramData\miniconda3\python.exe"
)

if "%PYTHON_CMD%"=="" (
    echo.
    echo [ERROR] Python installation path could not be found automatically.
    echo.
    pause
    exit /b 1
)

echo Found Python at: %PYTHON_CMD%
echo.

echo [1/2] Starting React Vite Frontend Server on http://localhost:5173/ ...
start "METEORA React Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend_source && npm run dev"
echo.

echo [2/2] Starting Django REST & ML Server on http://127.0.0.1:8000/ ...
echo.
echo ----------------------------------------------------
echo  METEORA CYCLONE PLATFORM IS READY!
echo  React Frontend:  http://localhost:5173/
echo  Django Backend:  http://127.0.0.1:8000/
echo ----------------------------------------------------
echo.

timeout /t 2 >nul
start http://localhost:5173/

%PYTHON_CMD% manage.py runserver 0.0.0.0:8000

