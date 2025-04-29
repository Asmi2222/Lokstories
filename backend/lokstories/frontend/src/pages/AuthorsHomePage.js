import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './AuthorsHomePage.css';
import Notification from './Notification'; // Import Notification component

const AuthorsHomePage = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    profile_picture: null
  });
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchBooks();
    fetchProfile();
    
    // Check for state passed from other components (upload or edit)
    if (location.state?.notification) {
      setNotification({
        message: location.state.notification.message,
        type: location.state.notification.type || 'success'
      });
      
      // Clean up the location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location]);

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

  const fetchProfile = () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      axios.get('http://localhost:8000/api/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        setProfile(response.data);
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
      });
    }
  };

  const handleUploadClick = () => {
    navigate('/upload-story');
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleEditClick = (bookId) => {
    navigate(`/edit-story/${bookId}`);
  };

  const handleDeleteClick = async (bookId) => {
    // Using the custom confirmation dialog instead of window.confirm
    const confirmDialog = document.getElementById('confirm-dialog');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const currentBookId = document.getElementById('current-book-id');
    
    // Set the book ID to a data attribute to access it when confirming
    currentBookId.value = bookId;
    
    // Show the dialog
    confirmDialog.classList.remove('hidden');
    
    // Handle delete confirmation
    const confirmDeleteHandler = async () => {
      const token = localStorage.getItem('token');
      const bookToDelete = currentBookId.value;
      
      try {
        await axios.delete(`http://localhost:8000/stories/delete/${bookToDelete}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Remove the deleted book from the state
        setBooks(books.filter(book => book.id !== parseInt(bookToDelete)));
        
        // Show success notification
        setNotification({
          message: 'Story deleted successfully!',
          type: 'success'
        });
        
        // Hide the dialog
        confirmDialog.classList.add('hidden');
        
        // Clean up event listeners
        confirmDeleteBtn.removeEventListener('click', confirmDeleteHandler);
        cancelDeleteBtn.removeEventListener('click', cancelDeleteHandler);
      } catch (err) {
        setError('Failed to delete the story');
        setNotification({
          message: 'Failed to delete the story. Please try again.',
          type: 'error'
        });
        console.error(err);
        confirmDialog.classList.add('hidden');
      }
    };
    
    // Handle cancel deletion
    const cancelDeleteHandler = () => {
      confirmDialog.classList.add('hidden');
      
      // Clean up event listeners
      confirmDeleteBtn.removeEventListener('click', confirmDeleteHandler);
      cancelDeleteBtn.removeEventListener('click', cancelDeleteHandler);
    };
    
    // Add event listeners
    confirmDeleteBtn.addEventListener('click', confirmDeleteHandler);
    cancelDeleteBtn.addEventListener('click', cancelDeleteHandler);
  };

  const handleLogout = () => {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/');
  };

  const handleNotificationClose = () => {
    setNotification(null);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      {notification && (
        <Notification 
          message={notification.message}
          type={notification.type}
          duration={3000}
          onClose={handleNotificationClose}
        />
      )}
    
      <header className="site-header">
        {/* Header content remains the same */}
        <div className="header-left">
          <button onClick={handleBackClick} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="site-logo ">Lokstories</div>
        </div>
        <div className="user-nav">
          <button onClick={handleLogout} className="logout-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Logout</span>
          </button>
          <Link to="/profile" className="profile-link">
            {profile.profile_picture ? (
              <img 
                src={`http://localhost:8000${profile.profile_picture}`} 
                alt="Profile" 
                className="user-avatar" 
              />
            ) : (
              <div className="user-avatar-placeholder">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </Link>
        </div>
      </header>

      {/* Rest of your component remains the same */}
      <div className="authors-homepage">
        <div className="page-header">
          <h1>My Books</h1>
          <div className="upload-button-container">
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

      {/* Custom Confirmation Dialog */}
      <div id="confirm-dialog" className="confirm-dialog-overlay hidden">
        <div className="confirm-dialog">
          <div className="confirm-dialog-header">
            <h3>Confirm Deletion</h3>
          </div>
          <div className="confirm-dialog-content">
            <p>Are you sure you want to delete this story?</p>
            <p className="warning-text">This action cannot be undone!</p>
          </div>
          <input type="hidden" id="current-book-id" />
          <div className="confirm-dialog-actions">
            <button id="cancel-delete" className="cancel-dialog-btn">Cancel</button>
            <button id="confirm-delete" className="confirm-dialog-btn">Delete</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthorsHomePage;