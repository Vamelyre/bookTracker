from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import books

app = FastAPI()

origins = [
    "http://localhost:5173",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router)

@app.get("/")
def read_root():
    return {"message": "Hello BookVerse!"}
