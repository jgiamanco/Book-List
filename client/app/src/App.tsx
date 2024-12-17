import { useEffect, useState, useRef } from "react";
import "./App.css";

interface Book {
  id: number;
  title: string;
  release_year: number;
}

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState(0);

  const [newTitle, setNewTitle] = useState("");
  const [newYear, setNewYear] = useState(0);
  const [editStates, setEditStates] = useState<{ [key: number]: { title: boolean; year: boolean } }>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const baseURL = process.env.CLIENT_PROD_URL || process.env.CLIENT_LOCAL_URL;

  const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setEditStates(false);
      }
  };

  useEffect(() => {
    if (editStates) {
        document.addEventListener('mousedown', handleClickOutside);
    } else {
        document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [editStates]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const toggleTitleClick = (id: number) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], title: !prev[id]?.title },
    }));
  };

  const toggleYearClick = (id: number) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], year: !prev[id]?.year },
    }));
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${baseURL}/api/books/`);
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.log(err);
    }
  };

  const addBook = async () => {
    const bookData = {
      title,
      release_year: releaseYear,
    };
    try {
      const response = await fetch(`${baseURL}/api/books/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      const data = await response.json();
      setBooks((prev) => [...prev, data]);
    } catch (err) {
      console.log(err);
    }
  };

  const updateBook = async (id: number, title: string, year: number ) => {
    await fetch(`${baseURL}/api/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({id: id, title: title, release_year: year }),
    });
    fetchBooks();
  };

  const deleteBook = async (pk: number) => {
    try {
      const response = await fetch(`${baseURL}/api/books/${pk}`, {
        method: "DELETE",
      });

      setBooks((prev) => prev.filter((book) => book.id !== pk));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <h1> Book List </h1>

      <div>
        <input
          type="text"
          placeholder="Book Title..."
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Release Year..."
          onChange={(e) => setReleaseYear(parseInt(e.target.value))}
        />
        <button onClick={addBook}> Add Book </button>
      </div>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Release Year</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {editStates[book.id]?.title ? (
                        <p>
                          <input
                            ref={inputRef}
                            placeholder={book.title}
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyUp={() => updateBook(book.id, newTitle, book.release_year)}
                          />
                        </p>
                      ) : (
                        <p onClick={() => toggleTitleClick(book.id)}>{book.title}</p>
                      )}
                    </td>
                    <td>
                      {editStates[book.id]?.year ? (
                        <p>
                          <input
                            ref={inputRef}
                            value={newYear}
                            onChange={(e) => setNewYear(Number(e.target.value))}
                            onKeyUp={() => updateBook(book.id, book.title, newYear)}
                          />
                        </p>
                      ) : (
                        <p onClick={() => toggleYearClick(book.id)}>{book.release_year}</p>
                      )}
                    </td>
                    <td><button onClick={() => deleteBook(book.id)}> Delete</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
    </>
  );
}

export default App;