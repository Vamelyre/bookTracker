from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from app import models
from app.database import SessionLocal, engine
import requests

# ceat etables
models.Base.metadata.create_all(bind=engine)

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
            

            if not db.query(models.Book).filter(models.Book.title==title).first():
                book = models.Book(
                    title=title,
                    author=", ".join(authors)
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
@app.get("/books")
def read_books(db: Session = Depends(get_db)):
    books = db.query(models.Book).all()
    return books

@app.post("/books")
def create_book(title: str, author: str, db: Session = Depends(get_db)):
    new_book = models.Book(title=title, author=author)
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book
