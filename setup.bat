@echo off
echo ============================================================
echo   CampusFlow - Smart Student OD & Leave Management System
echo ============================================================
echo Setting up environment for Windows...

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Please download and install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Copy environment files if not present
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo [OK] Created backend\.env
) else (
    echo [OK] backend\.env exists
)

if not exist frontend\.env (
    copy frontend\.env.example frontend\.env
    echo [OK] Created frontend\.env
) else (
    echo [OK] frontend\.env exists
)

if not exist backend\uploads (
    mkdir backend\uploads
)

:: Install dependencies
echo.
echo Installing packages...
call npm install
call npm --prefix backend install
call npm --prefix frontend install
echo [OK] Dependencies installed successfully.

:: Seed demo data
echo.
echo Seeding database with demo data...
call npm --prefix backend run seed

echo.
echo ============================================================
echo  SETUP COMPLETE! TO RUN:
echo ============================================================
echo  Execute: npm run dev
echo.
echo  Then open in your browser:
echo  - Frontend: http://localhost:5173
echo  - Backend:  http://localhost:5050/api/v1
echo  - Docs:     http://localhost:5050/api-docs
echo ============================================================
pause
