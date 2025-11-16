from app.database import SessionLocal, engine
from app import models

db = SessionLocal()

books = [
    {"title": "Dune", "author": "Frank Herbert"},
    {"title": "I, Robot", "author": "Isaac Asimov"},
    {"title": "Neuromancer", "author": "William Gibson"},
]

for book in books:
    db_book = models.Book(title=book["title"], author=book["author"])
    db.add(db_book)

db.commit()
db.close()
print("seeded database")
