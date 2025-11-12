interface Book {
  id: number
  title: string
  author: string
  genre: string
}

interface BookCardProps {
  book: Book
}

const BookCard: React.FC<BookCardProps> = ({ book }) => (
  <div className="p-4 rounded shadow hover:shadow-lg transition">
    <h2 className="font-bold text-lg">{book.title}</h2>
    <p className="text-gray-600">{book.author}</p>
    <p className="italic text-gray-500">{book.genre}</p>
  </div>
)

export default BookCard
