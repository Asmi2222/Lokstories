import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthorsHomePage.css';

const AuthorsHomePage = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = () => {
    const token = localStorage.getItem('token');

    if (token) {
      axios.get('http://localhost:8000/api/author/books/', {
        headers: {
          'Authorization': `Bearer ${token}`
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
  };

  const handleUploadClick = () => {
    navigate('/upload-story');
  };

  const handleEditClick = (bookId) => {
    navigate(`/edit-story/${bookId}`);
  };

  const handleDeleteClick = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      const token = localStorage.getItem('token');
      
      try {
        await axios.delete(`http://localhost:8000/stories/delete/${bookId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Remove the deleted book from the state
        setBooks(books.filter(book => book.id !== bookId));
      } catch (err) {
        setError('Failed to delete the story');
        console.error(err);
      }
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      <header className="site-header">
        <div className="site-logo">LOKSTORIES</div>
        <div className="user-nav">
          <Link to="/profile" className="profile-link">My Profile</Link>
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
              <div key={book.id} className="book-card">
                <Link to={`/stories/${book.id}`} className="story-link">
                  <img
                    src={book.cover_image ? `http://localhost:8000${book.cover_image}` : '/default-cover.jpg'}
                    alt={book.title}
                    className="book-cover"
                  />
                  <div className="book-info">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-description">{book.description}</p>
                  </div>
                </Link>
                <div className="book-actions">
                  <button 
                    className="edit-button"
                    onClick={() => handleEditClick(book.id)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteClick(book.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
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