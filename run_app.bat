@echo off
TITLE MUET Digital Assistant Setup

:: 1. Clone or update repository
if not exist "muet-prospectus-ai" (
    echo Cloning repository...
    git clone https://github.com/Ali-JR9/muet-prospectus-ai.git
    cd muet-prospectus-ai
) else (
    cd muet-prospectus-ai
    git pull origin main
)

:: 2. Create virtual environment if missing
if not exist "venv" (
    echo Setting up Python virtual environment...
    python -m venv venv
)

:: 3. Activate environment & install packages
call venv\Scripts\activate.bat
pip install -q fastapi uvicorn groq

:: 4. Build database if missing
if not exist "data\muet.db" (
    echo Building prospectus database...
    python setup_db.py
)

:: 5. Prompt for GROQ API Key if not set
if "%GROQ_API_KEY%"=="" (
    set /p GROQ_API_KEY="Enter your Groq API Key: "
)

:: 6. Launch browser & start FastAPI server
echo Starting MUET Digital Assistant...
start http://localhost:8001
uvicorn backend.main:app --port 8001

pause
