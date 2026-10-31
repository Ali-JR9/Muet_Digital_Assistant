@echo off
TITLE MUET Digital Assistant Setup

echo ===================================================
echo     MUET Digital Assistant One-Step Launcher
echo ===================================================

:: 1. Check Python installation
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed on this PC.
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    echo IMPORTANT: Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b
)

:: 2. Acquire Project Repository (Git or ZIP fallback)
if not exist "Muet_Digital_Assistant-main" if not exist "muet-prospectus-ai" (
    where git >nul 2>nul
    if %errorlevel% equ 0 (
        echo Cloning repository via Git...
        git clone https://github.com/Ali-JR9/Muet_Digital_Assistant.git
        cd Muet_Digital_Assistant
    ) else (
        echo Git not found. Downloading repository archive...
        powershell -Command "Invoke-WebRequest -Uri 'https://github.com/Ali-JR9/Muet_Digital_Assistant/archive/refs/heads/main.zip' -OutFile 'repo.zip'"
        powershell -Command "Expand-Archive -Path 'repo.zip' -DestinationPath '.' -Force"
        del repo.zip
        cd Muet_Digital_Assistant-main
    )
) else (
    if exist "Muet_Digital_Assistant" cd Muet_Digital_Assistant
    if exist "Muet_Digital_Assistant-main" cd Muet_Digital_Assistant-main
)

:: 3. Setup Virtual Environment
if not exist "venv" (
    echo Setting up Python environment...
    python -m venv venv
)

:: 4. Activate & Install Dependencies
call venv\Scripts\activate.bat
python -m pip install --upgrade pip -q
python -m pip install -q fastapi uvicorn groq

:: 5. Build Database
if not exist "data\muet.db" (
    echo Building prospectus database...
    python setup_db.py
)

:: 6. Get API Key if missing
if "%GROQ_API_KEY%"=="" (
    set /p GROQ_API_KEY="Enter your Groq API Key: "
)

:: 7. Start Application
echo Launching Assistant...
start http://localhost:8001
python -m uvicorn backend.main:app --port 8001

pause
