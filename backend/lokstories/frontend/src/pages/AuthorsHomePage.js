import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AuthorsHomepage = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');  // Retrieve the token from localStorage

    if (token) {
      axios.get('http://localhost:8000/api/author/books/', {
        headers: {
          'Authorization': `Bearer ${token}`  // Include token in the Authorization header
        }
      })
      .then(response => {
        setBooks(response.data);
      })
      .catch(err => {
        setError('Failed to fetch books');
        console.error(err);
      });
    } else {
      setError('No token found. Please login again.');
    }
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <h1>Welcome to the Authors' Homepage</h1>
      <div className="book-list">
        {books.length > 0 ? (
          books.map((book) => (
            <div key={book.id} className="book-card">
              <img src={`http://localhost:8000${book.cover_image}`} alt={book.title} />
              <h3>{book.title}</h3>
              <p>{book.description}</p>
            </div>
          ))
        ) : (
          <p>No books available.</p>
        )}
      </div>
    </div>
  );
};

export default AuthorsHomepage;
