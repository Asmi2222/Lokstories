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
  const [showUploadGuide, setShowUploadGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleGuideClick = () => {
    // Show the guide
    setShowUploadGuide(true);
    setCurrentStep(1);
  };

  const handleDirectUploadClick = () => {
    // Go directly to upload page without showing the guide
    navigate('/upload-story');
  };

  const handleSkipGuide = () => {
    setShowUploadGuide(false);
    navigate('/upload-story');
  };

  const handleProceedToUpload = () => {
    setShowUploadGuide(false);
    navigate('/upload-story');
  };

  const handleNextStep = () => {
    if (currentStep < 13) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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

  // Content for each step in the guide
  const getStepContent = (step) => {
    switch (step) {
      case 1:
        return {
          title: "Story Title",
          description: "Enter a captivating title for your story.",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          ),
          isMandatory: true
        };
      case 2:
        return {
          title: "Genre",
          description: "Mention the genre that best fits your story.",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          ),
          isMandatory: true
        };
      case 3:
        return {
          title: "Description",
          description: "Write a brief summary of your story to entice readers.",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="17" y1="10" x2="3" y2="10"></line>
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="21" y1="14" x2="3" y2="14"></line>
              <line x1="17" y1="18" x2="3" y2="18"></line>
            </svg>
          ),
          isMandatory: true
        };
      case 4:
        return {
          title: "Content",
          description: "Write the main content of your story.",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          ),
          isMandatory: true
        };
      case 5:
        return {
          title: "Cover Image",
          description: "Upload an eye-catching cover image for your story.",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          ),
          isMandatory: true
        };
      case 6:
        return {
          title: "Historic Website Name ",
          description: "If your story features a historic location, you can include the name of its website.",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          ),
          isMandatory: false
        };
      case 7:
        return {
          title: "Historic Location Description ",
          description: "Provide details about the historic location featured in your story.",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          ),
          isMandatory: false
        };
      case 8:
        return {
          title: "Location Map Link ",
          description: "Search the historic place on Google Maps, click 'Share', copy the link, and paste it on the upload page.",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
              <line x1="8" y1="2" x2="8" y2="18"></line>
              <line x1="16" y1="6" x2="16" y2="22"></line>
            </svg>
          ),
          isMandatory: false
        };
      case 9:
        return {
          title: "Food Name ",
          description: "If food is featured in your story, include the name of the dish.",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
          ),
          isMandatory: false
        };
      case 10:
        return {
          title: "Restaurant Name ",
          description: "Include the name of the restaurant where the food can be found.",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
          ),
          isMandatory: false
        };
      case 11:
        return {
          title: "Food Description ",
          description: "Provide a mouth-watering description of the food mentioned in your story.",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          ),
          isMandatory: false
        };
      case 12:
        return {
          title: "Restaurant Map Link ",
          description: "Search the restaurant on Google Maps, click 'Share', copy the link, and paste it on the upload page.",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
              <line x1="8" y1="2" x2="8" y2="18"></line>
              <line x1="16" y1="6" x2="16" y2="22"></line>
            </svg>
          ),
          isMandatory: false
        };
      case 13:
        return {
          title: "Terms and Conditions",
          description: "Read and agree to the terms and conditions before uploading your story.",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ),
          isMandatory: true
        };
      default:
        return { title: "", description: "", icon: null, isMandatory: false };
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const currentStepContent = getStepContent(currentStep);

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
        <div className="header-left">
          <button onClick={handleBackClick} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="site-logo">Lokstories</div>
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

      <div className="authors-homepage">
        <div className="page-header">
          <h1>My Books</h1>
          <div className="upload-buttons-container">
            <button className="guide-button" onClick={handleGuideClick}>
              <span className="guide-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </span>
              Guide to Upload
            </button>
            <button className="upload-button" onClick={handleDirectUploadClick}>
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

      {/* Upload Guide Popup */}
      {showUploadGuide && (
        <div className="guide-overlay">
          <div className="guide-popup">
            <div className="guide-header">
              <h2>Story Upload Guide</h2>
              <button className="close-guide" onClick={() => setShowUploadGuide(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="guide-progress">
              <div className="progress-bar">
                <div className="progress" style={{ width: `${(currentStep / 13) * 100}%` }}></div>
              </div>
              <div className="progress-text">
                Step {currentStep} of 13
              </div>
            </div>
            
            <div className="guide-content">
              <div className="step-icon">{currentStepContent.icon}</div>
              <h3 className="step-title">
                {currentStepContent.title}
                {currentStepContent.isMandatory && <span className="mandatory-badge">Required</span>}
                {!currentStepContent.isMandatory && <span className="optional-badge">Optional</span>}
              </h3>
              <p className="step-description">{currentStepContent.description}</p>
            </div>
            
            <div className="guide-actions">
              <button 
                className="skip-guide-btn" 
                onClick={handleSkipGuide}
              >
                Skip Guide
              </button>
              <div className="step-navigation">
                <button 
                  className={`prev-step ${currentStep === 1 ? 'disabled' : ''}`}
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                  Previous
                </button>
                {currentStep < 13 ? (
                  <button className="next-step" onClick={handleNextStep}>
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                ) : (
                  <button className="proceed-btn" onClick={handleProceedToUpload}>
                    Let's Write!
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/>
                      <path d="M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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