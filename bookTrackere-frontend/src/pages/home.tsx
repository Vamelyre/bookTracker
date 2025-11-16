import React, { useEffect, useState } from "react";
import { createBook } from "../api";

interface Book {
  id: number;
  title: string;
  author: string;
  cover_url?: string | null;
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBooks = async (query: string = "") => {
    setError(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/books${query ? `?search=${query}` : ""}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch books: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log("Fetched books:", data); // Debug log
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch books. Make sure the backend is running on http://127.0.0.1:8000";
      setError(errorMessage);
      setBooks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    fetchBooks(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) return;

    setSubmitting(true);
    try {
      const newBook = await createBook(title, author);
      setBooks([...books, newBook]); // update the list
      setTitle("");
      setAuthor("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-custom-pink-200 border-custom-pink-400 mb-4"></div>
          <p className="text-custom-pink-400 text-xl font-semibold">Loading your books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-custom-pink-300 via-custom-pink-400 to-custom-pink-400 bg-clip-text text-transparent">
            My Book Collection
          </h1>
        </div>
        
        {error && (
          <div className="bg-custom-pink-100 border-2 border-custom-pink-300 text-custom-pink-400 px-6 py-4 rounded-2xl mb-6 shadow-lg">
            <strong className="font-semibold">Oops!</strong>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={handleSearch}
              className="w-full px-5 py-4 rounded-2xl border-2 border-custom-pink-200 bg-white/80 backdrop-blur-sm text-custom-pink-400 placeholder-custom-pink-300 focus:outline-none focus:ring-4 focus:ring-custom-pink-200 focus:border-custom-pink-400 shadow-lg transition-all duration-300"
            />
          </div>
        </div>

        {/* Add Book Form */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-xl border-2 border-custom-pink-200">
          <h2 className="text-2xl font-bold text-custom-pink-400 mb-4">
            Add a New Book
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Book Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border-2 border-custom-pink-200 bg-white/90 text-custom-pink-400 placeholder-custom-pink-300 focus:outline-none focus:ring-4 focus:ring-custom-pink-200 focus:border-custom-pink-400 shadow-md transition-all duration-300"
            />
            <input
              type="text"
              placeholder="Author Name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border-2 border-custom-pink-200 bg-white/90 text-custom-pink-400 placeholder-custom-pink-300 focus:outline-none focus:ring-4 focus:ring-custom-pink-200 focus:border-custom-pink-400 shadow-md transition-all duration-300"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl border-2 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              style={{ backgroundColor: '#ffaad7', borderColor: '#ffaad7' }}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Adding...</span>
                </>
              ) : (
                "Add Book"
              )}
            </button>
          </form>
        </div>

        {/* Book List */}
        {books.length === 0 ? (
          <div className="text-center py-12 bg-white/40 backdrop-blur-sm rounded-3xl border-2 border-custom-pink-200 shadow-lg">
            <p className="text-custom-pink-400 text-xl font-semibold">No books yet!</p>
            <p className="text-custom-pink-400 mt-2">Start adding your favorite reads above</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-custom-pink-400 mb-6">
              Your Books ({books.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {books.map((book) => (
                <div 
                  key={book.id} 
                  className="bg-white/70 backdrop-blur-sm border-2 border-custom-pink-200 rounded-2xl shadow-lg hover:shadow-xl hover:border-custom-pink-300 transform hover:scale-[1.05] transition-all duration-300 overflow-hidden group cursor-pointer"
                >
                  <div className="aspect-[2/3] overflow-hidden bg-custom-pink-100 relative">
                    {book.cover_url ? (
                      <img 
                        src={book.cover_url} 
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          console.error("Image failed to load for:", book.title, "URL:", book.cover_url);
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-custom-pink-300 text-sm text-center px-2">No Cover</span></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-custom-pink-300 text-sm text-center px-2">No Cover</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-base text-custom-pink-400 mb-1 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-custom-pink-400 italic text-sm line-clamp-1">
                      {book.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

