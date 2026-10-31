import os
import sqlite3

DB_PATH = "data/muet.db"
TXT_PATH = "data/prospectus.txt"

def init_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT
        )
    ''')
    
    if not os.path.exists(TXT_PATH):
        print("Error: prospectus.txt not found in data/ directory!")
        return

    with open(TXT_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Split by double newlines into distinct paragraphs
    paragraphs = content.split("\n\n")
    
    count = 0
    for p in paragraphs:
        p_clean = p.strip()
        if len(p_clean) > 30:
            lines = p_clean.split('\n')
            title = lines[0][:80]
            cursor.execute("INSERT INTO sections (title, content) VALUES (?, ?)", (title, p_clean))
            count += 1

    conn.commit()
    conn.close()
    print(f"Successfully imported {count} paragraph sections into data/muet.db!")

if __name__ == "__main__":
    init_db()
