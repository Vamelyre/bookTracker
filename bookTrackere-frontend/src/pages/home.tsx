import { useEffect, useState } from 'react'
import BookCard from '../components/BookCard'


interface Book {
id: number;
title: string;
author: string;
genre: string;
}


const Home: React.FC = () => {

const [books, setBooks] = useState<Book[]>([])


useEffect(() => {
  fetch('http://127.0.0.1:8000/books')
    .then(res => res.json())
    .then(data => setBooks(data.books))
    .catch(err => console.error(err))
}, [])


return (
<div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
{books.map(book => <BookCard key={book.id} book={book} />)}
</div>
)
}


export default Home