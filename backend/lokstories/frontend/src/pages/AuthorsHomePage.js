import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AuthorsHomePage.css';

const AuthorsHomePage = () => {
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

  const handleUploadClick = () => {
    // Implement navigation to upload page
    window.location.href = '/upload-story';
    // Or if using React Router:
    // history.push('/upload-story');
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      <header className="site-header">
        <div className="site-logo">LOKSTORIES</div>
        <div className="user-nav">
          <div className="user-avatar">
            <img src="/api/placeholder/36/36" alt="User" />
          </div>
        </div>
      </header>

      <div className="authors-homepage">
        <div className="page-header">
          <h1>My Books</h1>
          <button className="upload-button" onClick={handleUploadClick}>
            <span className="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </span>
            Upload Story
          </button>
        </div>

        <div className="book-list">
          {books.length > 0 ? (
            books.map((book) => (
              <Link to={`/stories/${book.id}`} key={book.id} className="story-link">
                <div className="book-card">
                  <img
                    src={`http://localhost:8000${book.cover_image}`}
                    alt={book.title}
                    className="book-cover"
                  />
                  <h3>{book.title}</h3>
                  <p>{book.description}</p>
                </div>
              </Link>
            ))
          ) : (
            <p>No books available. Start writing your first story!</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthorsHomePage;
