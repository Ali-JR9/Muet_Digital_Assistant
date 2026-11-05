import sqlite3
import os

os.makedirs("data", exist_ok=True)
conn = sqlite3.connect("data/muet.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS prospectus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    title TEXT,
    content TEXT
)
""")

cursor.execute("DELETE FROM prospectus")

sections = [
    ("General", "MUET Overview", "Mehran University of Engineering and Technology (MUET) Jamshoro is a premier institution providing exceptional education in engineering, technology, and sciences, fostering innovation, research, and professional engineering attributes."),
    ("Admissions", "Eligibility Criteria", "Minimum 60% marks in HSC Pre-Engineering or equivalent are required for undergraduate admission at Mehran University of Engineering and Technology (MUET)."),
    ("Departments", "Computer Systems Engineering", "The Computer Systems Engineering department offers comprehensive programs covering C++, Data Structures, algorithms, and artificial intelligence."),
    ("Departments", "Software Engineering", "The Software Engineering Department focuses on the application of theoretical approaches to the development, operation, and maintenance of software systems."),
    ("Campus", "Admin Block Location", "The Admin Block of Mehran University of Engineering and Technology (MUET) is situated on the main campus, housing the Registrar Office, Finance Department, and Student Affairs."),
    ("Library", "MUET Library & Online Information Center", "The MUET library serves as a central hub for academic resources, providing e-resources, research articles, and digital library access supporting HEC digital resources.")
]

cursor.executemany("INSERT INTO prospectus (category, title, content) VALUES (?, ?, ?)", sections)
conn.commit()
conn.close()
print("Database updated with correct MUET name.")
