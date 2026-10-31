@echo off
TITLE MUET Digital Assistant Setup

echo ===================================================
echo     MUET Digital Assistant One-Step Launcher
echo ===================================================

:: 1. Verify Python availability
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Python is not installed or not added to PATH on this PC.
    echo Please install Python 3.10+ and check "Add python.exe to PATH".
    echo.
    pause
    exit /b
)

:: 2. Download Project Archive if missing
if not exist "Muet_Digital_Assistant-main" if not exist "Muet_Digital_Assistant" (
    where git >nul 2>nul
    if %errorlevel% equ 0 (
        echo Downloading application code via Git...
        git clone https://github.com/Ali-JR9/Muet_Digital_Assistant.git
    ) else (
        echo Git not found. Downloading application ZIP package...
        powershell -Command "Invoke-WebRequest -Uri 'https://github.com/Ali-JR9/Muet_Digital_Assistant/archive/refs/heads/main.zip' -OutFile 'repo.zip'"
        powershell -Command "Expand-Archive -Path 'repo.zip' -DestinationPath '.' -Force"
        del repo.zip
    )
)

:: 3. Change directory into project folder BEFORE running Python commands
if exist "Muet_Digital_Assistant" (
    cd Muet_Digital_Assistant
) else if exist "Muet_Digital_Assistant-main" (
    cd Muet_Digital_Assistant-main
)

:: 4. Create virtual environment
if not exist "venv" (
    echo Creating Python environment...
    python -m venv venv
)

:: 5. Activate & install packages
call venv\Scripts\activate.bat
python -m pip install -q fastapi uvicorn groq

:: 6. Build database
if not exist "data\muet.db" (
    echo Building prospectus database...
    python setup_db.py
)

:: 7. Prompt for API Key securely
if "%GROQ_API_KEY%"=="" (
    set /p GROQ_API_KEY="Enter your Groq API Key: "
)

:: 8. Launch browser & server
echo Launching MUET Digital Assistant...
start http://localhost:8001
python -m uvicorn backend.main:app --port 8001

pause
