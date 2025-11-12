from fastapi import APIRouter

router = APIRouter()

# Sample book data
books = [
    {"id": 1, "title": "The Odyssey", "author": "homer", "genre": "epic poetry"},
    {"id": 2, "title": "Dune", "author": "Frank Herbert", "genre": "Sci-Fi"},
    {"id": 3, "title": "all quiet on the western front", "author": "remarque", "genre": "war story"}
]

@router.get("/books")
def get_books():
    return {"books": books}
