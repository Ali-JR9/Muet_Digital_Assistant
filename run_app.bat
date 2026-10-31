@echo off
TITLE MUET Digital Assistant Setup

echo ===================================================
echo     MUET Digital Assistant One-Step Launcher
echo ===================================================

:: 1. Verify Python availability
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to PATH on this PC.
    pause
    exit /b
)

:: 2. Download code via Git or PowerShell
if not exist "Muet_Digital_Assistant" if not exist "Muet_Digital_Assistant-main" (
    where git >nul 2>nul
    if %errorlevel% equ 0 (
        echo Downloading application code via Git...
        git clone https://github.com/Ali-JR9/Muet_Digital_Assistant.git
    ) else (
        echo Git not found. Downloading application ZIP package...
        powershell -Command "Invoke-WebRequest -Uri 'https://github.com/Ali-JR9/Muet_Digital_Assistant/archive/refs/heads/main.zip' -OutFile 'repo.zip'; Expand-Archive -Path 'repo.zip' -DestinationPath '.' -Force; Remove-Item 'repo.zip'"
    )
)

:: 3. Change directory into project folder
if exist "Muet_Digital_Assistant" (
    cd /d "%~dp0Muet_Digital_Assistant"
) else if exist "Muet_Digital_Assistant-main" (
    cd /d "%~dp0Muet_Digital_Assistant-main"
)

:: 4. Virtual environment & dependencies
if not exist "venv" (
    echo Creating Python environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
python -m pip install -q fastapi uvicorn groq

:: 5. Build database
if not exist "data\muet.db" (
    echo Building prospectus database...
    python setup_db.py
)

:: 6. API Key Prompt
if "%GROQ_API_KEY%"=="" (
    set /p GROQ_API_KEY="Enter your Groq API Key: "
)

:: 7. Launch
echo Launching MUET Digital Assistant...
start http://localhost:8001
python -m uvicorn backend.main:app --port 8001

pause
