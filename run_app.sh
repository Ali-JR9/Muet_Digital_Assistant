#!/bin/bash

# Navigate to home directory and clone if repo doesn't exist
if [ ! -d "muet-prospectus-ai" ]; then
    echo "Cloning repository..."
    git clone https://github.com/Ali-JR9/muet-prospectus-ai.git
    cd muet-prospectus-ai
else
    cd muet-prospectus-ai
    git pull origin main
fi

# Create virtual environment if missing
if [ ! -d "venv" ]; then
    echo "Setting up virtual environment..."
    python3 -m venv venv
fi

# Activate environment and install dependencies
source venv/bin/activate
pip install -q fastapi uvicorn groq

# Build database if missing
if [ ! -f "data/muet.db" ]; then
    echo "Building database..."
    python setup_db.py
fi

# Prompt for API Key if not set
if [ -z "$GROQ_API_KEY" ]; then
    echo -n "Enter your Groq API Key: "
    read -s GROQ_KEY_INPUT
    echo ""
    export GROQ_API_KEY="$GROQ_KEY_INPUT"
fi

# Launch browser and server automatically
echo "Starting MUET Digital Assistant..."
(sleep 2 && xdg-open http://localhost:8001) &
uvicorn backend.main:app --port 8001
