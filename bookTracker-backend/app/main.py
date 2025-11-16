from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, inspect, text
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from app import models
from app.database import SessionLocal, engine
from app.schemas import Book
import requests


# Create tables and handle column migration
def setup_database():
    """Create tables and migrate cover_image_url to cover_url if needed"""
    models.Base.metadata.create_all(bind=engine)
    
    # Check if old column exists and migrate
    inspector = inspect(engine)
    if 'books' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('books')]
        if 'cover_image_url' in columns and 'cover_url' not in columns:
            # Migrate: rename column
            with engine.connect() as conn:
                try:
                    conn.execute(text("ALTER TABLE books RENAME COLUMN cover_image_url TO cover_url"))
                    conn.commit()
                    print("Migrated cover_image_url to cover_url")
                except Exception as e:
                    print(f"Migration note: {e}")
                    # If rename fails, try to add new column and copy data
                    try:
                        conn.execute(text("ALTER TABLE books ADD COLUMN cover_url VARCHAR"))
                        conn.execute(text("UPDATE books SET cover_url = cover_image_url"))
                        conn.commit()
                        print("Added cover_url column and copied data")
                    except Exception as e2:
                        print(f"Could not migrate: {e2}")

setup_database()

app = FastAPI(title="bookTrackere API")


# cors middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()




# Helper function to fetch book cover from Google Books API
def fetch_book_cover(title: str, author: str) -> Optional[str]:
    """Fetch book cover image URL from Google Books API"""
    try:
        query = f"{title} {author}"
        url = "https://www.googleapis.com/books/v1/volumes"
        params = {"q": query, "maxResults": 1}
        response = requests.get(url, params=params, timeout=5)
        data = response.json()
        
        if data.get("items"):
            volume_info = data["items"][0].get("volumeInfo", {})
            image_links = volume_info.get("imageLinks", {})
            # Try to get thumbnail or small thumbnail
            cover_url = image_links.get("thumbnail") or image_links.get("smallThumbnail")
            if cover_url:
                # Replace http with https for better security
                return cover_url.replace("http://", "https://")
    except Exception as e:
        print(f"Error fetching cover for {title}: {e}")
    return None

# api seeding function
def fetch_and_seed_books(query="fantasy", max_results=50):
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
            image_links = volume_info.get("imageLinks", {})
            cover_url = image_links.get("thumbnail") or image_links.get("smallThumbnail")
            if cover_url:
                cover_url = cover_url.replace("http://", "https://")

            if not db.query(models.Book).filter(models.Book.title==title).first():
                book = models.Book(
                    title=title,
                    author=", ".join(authors),
                    cover_url=cover_url
                )
                db.add(book)
        db.commit()
        print(f"{max_results} books fetched and added!")
    finally:
        db.close()



#seed books on server startup
@app.on_event("startup")
def seed_books_on_startup():
    fetch_and_seed_books(query="fantasy", max_results=50)




#routes
@app.get("/books", response_model=List[Book])
def read_books(search: str = Query(None), db: Session = Depends(get_db)):
    if search:
        books = db.query(models.Book).filter(
            or_(
                models.Book.title.ilike(f"%{search}%"),
                models.Book.author.ilike(f"%{search}%")
            )
        ).all()
    else:
        books = db.query(models.Book).all()
    return books

@app.post("/books", response_model=Book)
def create_book(title: str, author: str, db: Session = Depends(get_db)):
    # Fetch book cover from Google Books API
    cover_url = fetch_book_cover(title, author)
    new_book = models.Book(title=title, author=author, cover_url=cover_url)
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book
