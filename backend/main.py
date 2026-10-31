import os
import sqlite3
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from groq import Groq

app = FastAPI(title="MUET Digital Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_KEY = os.environ.get("GROQ_API_KEY", "")
client = Groq(api_key=GROQ_KEY) if GROQ_KEY else None
DB_PATH = "data/muet.db"

# Extended stop-word list including common conversational verbs & action words
STOP_WORDS = {
    "tell", "me", "about", "what", "is", "the", "give", "details", 
    "information", "on", "show", "how", "to", "can", "you", "i", 
    "want", "know", "where", "are", "which", "does", "do", "please",
    "explain", "find", "get", "regarding", "process", "procedure",
    "enter", "entry", "go", "in", "into", "access", "join", "way", "reach"
}

def clean_text(text: str) -> str:
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        line_stripped = re.sub(r'^[□■▪▫\-\*\•\s]+', '', line)
        if len(line_stripped.strip()) > 3:
            cleaned_lines.append(line_stripped.strip())
    return " ".join(cleaned_lines)

def search_database(query: str) -> str:
    if not os.path.exists(DB_PATH):
        return "Database not found. Please run setup_db.py first."

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    raw_words = re.findall(r'\b\w+\b', query.lower())
    query_words = [w for w in raw_words if len(w) > 2 and w not in STOP_WORDS]
    
    # Fallback to raw words if all words were stripped by stop words
    if not query_words:
        query_words = [w for w in raw_words if len(w) > 2]

    if not query_words:
        conn.close()
        return "No valid search terms provided."

    like_clauses = " OR ".join(["content LIKE ?" for _ in query_words])
    params = [f"%{word}%" for word in query_words]
    
    cursor.execute(f"SELECT title, content FROM sections WHERE {like_clauses}", params)
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return "No matching information found in the database."

    scored_sections = []
    for title, content in rows:
        cleaned = clean_text(content)
        lower_content = cleaned.lower()
        lower_title = title.lower()
        
        score = 0
        for w in query_words:
            # Massive score multiplier for exact title matches (e.g. Sports/Gymnasium section)
            if w in lower_title:
                score += 50
            score += lower_content.count(w) * 5

        scored_sections.append((score, cleaned))

    scored_sections.sort(key=lambda x: x[0], reverse=True)
    
    top_matches = [item[1] for item in scored_sections[:2]]
    combined_context = "\n\n".join(top_matches)
    return combined_context[:1500]

def synthesize_with_llm(query: str, context: str) -> str:
    if "No matching information" in context or "Database not found" in context:
        return f"I couldn't find specific details regarding '{query}' in the prospectus database."

    if not client:
        return f"GROQ_API_KEY not set. Context:\n\n{context[:500]}"

    system_prompt = (
        "You are the official MUET Digital Assistant.\n"
        "Instructions:\n"
        "1. Identify the core subject of the user's inquiry (e.g., for 'how to enter in gymnasium', the topic is 'the MUET Gymnasium & Sports Facilities').\n"
        "2. Start your response with exactly: 'Here is the complete knowledge about [extracted topic]:'\n"
        "3. Synthesize a helpful, complete explanation using the provided prospectus context.\n"
        "4. Conclude with a clear summary sentence. Ensure no sentence is left incomplete."
    )

    user_prompt = f"Context from Prospectus:\n{context}\n\nUser Question: {query}"

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=450
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[GROQ ERROR]: {e}")
        return f"Error contacting Groq LLM: {str(e)}"

@app.get("/search")
async def search_endpoint(q: str = ""):
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    context = search_database(q)
    final_answer = synthesize_with_llm(q, context)
    return {"result": final_answer}

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(content="", media_type="image/x-icon")

if os.path.exists("frontend"):
    app.mount("/static", StaticFiles(directory="frontend"), name="static")

@app.get("/")
async def serve_home():
    return FileResponse(os.path.join("frontend", "index.html"))
