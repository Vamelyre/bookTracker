import requests
from app.database import SessionLocal
from app import models

def fetch_and_seed_books(query="science fiction", max_results=20):
    url = "https://www.googleapis.com/books/v1/volumes"
    params = {"q": query, "maxResults": max_results}
    response = requests.get(url, params=params)
    data = response.json()

    db = SessionLocal()
    try:
        for item in data.get("items", []):
            volume_info = item.get("volumeInfo", {})
            title = volume_info.get("title", "No Title")
            authors = volume_info.get("authors", ["Unknown"])
            if not db.query(models.Book).filter(models.Book.title==title).first():
                book = models.Book(title=title, author=", ".join(authors))
                db.add(book)
        db.commit()
        print("Books fetched and added!")
    finally:
        db.close()