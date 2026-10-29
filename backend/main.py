from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import os

app = FastAPI(title="MUET Prospectus AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/search")
def search_prospectus(query: str):
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # Path to the compiled C++ search_engine binary in the parent/root directory
    binary_path = "./search_engine"
    if not os.path.exists(binary_path):
        binary_path = "../search_engine"
        
    if not os.path.exists(binary_path):
        raise HTTPException(status_code=500, detail="C++ search engine binary not found.")

    try:
        result = subprocess.run(
            [binary_path, query],
            capture_output=True,
            text=True,
            check=True
        )
        return {"query": query, "result": result.stdout.strip()}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"C++ engine error: {e.stderr.strip()}")
