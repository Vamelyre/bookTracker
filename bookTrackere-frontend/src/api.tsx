export const API_URL = "http://127.0.0.1:8000";

export async function fetchBooks() {
  const response = await fetch(`${API_URL}/books`);
  if (!response.ok) {
    throw new Error("failed to fetch the books");
  }
  return response.json();
}

export async function createBook(title: string, author: string) {
  const response = await fetch(`${API_URL}/books?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("failed to create a book");
  }
  return response.json();
}
