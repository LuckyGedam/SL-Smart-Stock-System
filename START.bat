@echo off
echo ================================================
echo   SL Crockeries - Smart Stock Priority System
echo ================================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install from https://python.org
    pause & exit
)

:: Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause & exit
)

:: Install Python deps if needed
if not exist ".venv\Scripts\activate.bat" (
    echo [1/4] Creating Python virtual environment...
    python -m venv .venv
)

echo [2/4] Installing Python dependencies...
call .venv\Scripts\activate.bat
pip install -r backend\requirements.txt -q

:: Install Node deps if needed
if not exist "node_modules" (
    echo [3/4] Installing Node dependencies...
    npm install
)

echo [4/4] Starting servers...
echo.
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:3000
echo  API Docs: http://localhost:8000/docs
echo.

:: Start backend in background
start "SSPS Backend" cmd /k "call .venv\Scripts\activate.bat && uvicorn backend.main:app --reload --port 8000"

:: Wait 2 seconds then start frontend
timeout /t 2 /nobreak >nul
start "SSPS Frontend" cmd /k "npm run dev"

:: Open browser
timeout /t 4 /nobreak >nul
start http://localhost:3000

echo.
echo Both servers are starting. Browser will open automatically.
echo Close both terminal windows to stop the app.
pause
