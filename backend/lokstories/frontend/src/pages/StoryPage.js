import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StoryPage.css';
import { getUserRole } from '../utils/auth';



const StoryPage = () => {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedStory, setTranslatedStory] = useState(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [showThankYouPopup, setShowThankYouPopup] = useState(false);
  
  // Rating states
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // Delete confirmation states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const [showCommentSuccessPopup, setShowCommentSuccessPopup] = useState(false);
const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
const [commentActionMessage, setCommentActionMessage] = useState('');

  // Map URL states
  const [mapUrl, setMapUrl] = useState({
    historic: "",
    restaurant: ""
  });
  
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = parseInt(localStorage.getItem('user_id'));

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    // Time intervals in seconds
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };
    
    let counter;
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      counter = Math.floor(seconds / secondsInUnit);
      if (counter > 0) {
        return `${counter} ${unit}${counter === 1 ? '' : 's'} ago`;
      }
    }
    
    return 'just now';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const fetchData = async () => {
      try {
        const [storyRes, commentsRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/stories/${id}/`),
          axios.get(`http://localhost:8000/api/comments/story/${id}/`)
        ]);
        
        setStory(storyRes.data);
        setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
    
        // Check for existing user rating
        try {
          const ratingRes = await axios.get(
            `http://localhost:8000/api/ratings/story/${id}/`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (ratingRes.data?.user_rating) {
            setUserRating(ratingRes.data.user_rating);
            setHasRated(true);
          }
        } catch (err) {
          if (err.response?.status !== 404) {
            console.error('Rating fetch error:', err);
          }
        }
      } catch (err) {
        setError('Failed to load story data');
        console.error(err);
      } finally {
        setLoading(false);
        setCommentsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (story) {
      const role = getUserRole();
      const isAuthor = role === 'Author';
      const isStoryOwner = story.author === parseInt(localStorage.getItem('user_id'));
      
      // If user is author but doesn't own this story, redirect
      if (isAuthor && !isStoryOwner) {
        navigate('/unauthorized');
      }
    }
  }, [story, navigate]); 


  useEffect(() => {
    const loadMapUrls = async () => {
      if (story) {
        console.log("Historic site URL from DB:", story.historic_site_url);
        console.log("Restaurant URL from DB:", story.restaurant_url);
        
        if (story.historic_site_url) {
          try {
            const url = await getEmbeddableMapUrl(story.historic_site_url);
            console.log("Processed historic site URL:", url);
            setMapUrl(prevState => ({...prevState, historic: url}));
          } catch (err) {
            console.error("Error processing historic site URL:", err);
          }
        }
        
        if (story.restaurant_url) {
          try {
            const url = await getEmbeddableMapUrl(story.restaurant_url);
            console.log("Processed restaurant URL:", url);
            setMapUrl(prevState => ({...prevState, restaurant: url}));
          } catch (err) {
            console.error("Error processing restaurant URL:", err);
          }
        }
      }
    };
    
    loadMapUrls();
  }, [story]);

  const handleTranslate = async () => {
    if (!story) return;
    
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }

    setTranslationLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/translate/', {
        text: JSON.stringify({
          title: story.title,
          description: story.description,
          content: story.content,
          genre: story.genre,
          historic_site_name: story.historic_site_name || '',
          historic_site_description: story.historic_site_description || '',
          food_name: story.food_name || '',
          restaurant_name: story.restaurant_name || '',
          food_description: story.food_description || ''
        })
      });
      
      const translatedData = JSON.parse(response.data.translation);
      setTranslatedStory(translatedData);
      setIsTranslated(true);
    } catch (err) {
      console.error('Translation error:', err);
      alert('Failed to translate. Please try again.');
    } finally {
      setTranslationLoading(false);
    }
  };

  const getText = (field) => {
    if (!isTranslated || !translatedStory) return story[field] || '';
    return translatedStory[field] || story[field] || '';
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
  
    try {
      const response = await axios.post(`http://localhost:8000/api/comments/add`, {
        story: id,
        content: newComment
      });
      
      setComments([...comments, response.data]);
      setNewComment('');
      
      // Show success popup
      setCommentActionMessage('Comment added successfully!');
      setShowCommentSuccessPopup(true);
      
      // Auto-close popup after 3 seconds
      setTimeout(() => {
        setShowCommentSuccessPopup(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to submit comment:', err);
      alert(err.response?.data?.detail || 'Failed to post comment. Please try again.');
    }
  };

  // Modified to show custom confirmation dialog
  const initiateDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      await axios.delete(`http://localhost:8000/api/comments/${commentToDelete}/`);
      setComments(comments.filter(comment => comment.id !== commentToDelete));
      setShowDeleteConfirmation(false);
      setCommentToDelete(null);
      
      // Show success popup
      setCommentActionMessage('Comment deleted successfully!');
      setShowDeleteSuccessPopup(true);
      
      // Auto-close popup after 3 seconds
      setTimeout(() => {
        setShowDeleteSuccessPopup(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert(err.response?.data?.detail || 'You can only delete your own comments');
    }
  };

  // Cancel delete
  const cancelDeleteComment = () => {
    setShowDeleteConfirmation(false);
    setCommentToDelete(null);
  };

  // Rating handlers
  const openRatingPopup = () => {
    setShowRatingPopup(true);
  };

  const closeRatingPopup = () => {
    setShowRatingPopup(false);
    setHoverRating(0);
  };

  const handleRatingSubmit = async () => {
    const token = localStorage.getItem('token');
    setRatingSubmitting(true);
    
    try {
      const response = await axios.post(
        'http://localhost:8000/api/ratings/rate/',
        { story: parseInt(id), rating: userRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update using the response data
      setStory(response.data.story);  // Contains updated avg_rating
      setHasRated(true);
      closeRatingPopup();
      
      // Show thank you popup
      setShowThankYouPopup(true);
      
      // Auto-close thank you popup after 3 seconds
      setTimeout(() => {
        setShowThankYouPopup(false);
      }, 3000);
      
    } catch (err) {
      console.error('Rating submission error:', err);
      if (err.response) {
        if (err.response.status === 400) {
          alert(err.response.data.detail || 'Invalid rating data');
        } else {
          alert('Failed to submit rating. Please try again.');
        }
      }
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleStarClick = (rating) => {
    setUserRating(rating);
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getEmbeddableMapUrl = async (url) => {
    // Validate the URL
    if (!url || typeof url !== 'string' || url.trim() === '') {
      console.log('Empty URL provided, using default map');
      return "https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Nepal";
    }
    
    console.log('Processing map URL:', url);
    const cleanUrl = url.trim();
    
    // Handle Google Maps short URLs (maps.app.goo.gl)
    if (cleanUrl.includes('maps.app.goo.gl') || cleanUrl.includes('goo.gl/maps')) {
      try {
        console.log('Attempting to resolve short URL:', cleanUrl);
        
        // Use a CORS proxy to fetch the actual URL
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(cleanUrl)}`;
        const response = await fetch(proxyUrl, { 
          method: 'GET',
          redirect: 'follow'
        });
        
        // If the fetch fails or doesn't redirect properly
        if (!response.ok) {
          throw new Error('Failed to expand URL');
        }
        
        // Try to get the final URL from the response URL
        const fullUrl = response.url;
        console.log('Expanded URL:', fullUrl);
        
        // Look for coordinates in the expanded URL
        const coordMatch = fullUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch) {
          console.log(`Found coordinates: ${coordMatch[1]}, ${coordMatch[2]}`);
          return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${coordMatch[1]},${coordMatch[2]}&zoom=15`;
        }
        
        // If no coordinates found but we did expand the URL, use it as place search
        if (fullUrl !== proxyUrl) {
          return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(fullUrl)}`;
        }
      } catch (error) {
        console.error('Error expanding short URL:', error);
        // If we can't expand the URL, let's try using location names from the story
      }
    }
    
    // For standard Google Maps URLs
    if (cleanUrl.includes('google.com/maps')) {
      // Extract coordinates (e.g., @27.7172,85.3240,15z)
      const coordMatch = cleanUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${coordMatch[1]},${coordMatch[2]}&zoom=15`;
      }
    }
    
    // Fallback: use the place name from the story instead of the URL
    return null; // Return null to trigger the fallback in the iframe
  };

  // Star rating component
  const StarRating = ({ totalStars = 5, interactive = true }) => {
    const displayRating = hoverRating || userRating;
    
    return (
      <div className="star-rating">
        {[...Array(totalStars)].map((_, i) => {
          const starValue = i + 1;
          return (
            <span 
              key={i}
              className={`star ${starValue <= displayRating ? 'filled' : 'empty'}`}
              onClick={interactive ? () => handleStarClick(starValue) : undefined}
              onMouseEnter={interactive ? () => handleStarHover(starValue) : undefined}
              onMouseLeave={interactive ? handleStarLeave : undefined}
            >
              ★
            </span>
          );
        })}
      </div>
    );
  };

  // Default avatar for comments without profile pictures
  const getDefaultAvatar = (username) => {
    // Generate a color based on the username
    const colors = [
      '#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33F3',
      '#33FFF3', '#F3FF33', '#FF8C33', '#8C33FF', '#33FFCC'
    ];
    
    const colorIndex = username.charCodeAt(0) % colors.length;
    const initials = username.charAt(0).toUpperCase();
    
    return (
      <div 
        className="default-avatar" 
        style={{ backgroundColor: colors[colorIndex] }}
      >
        {initials}
      </div>
    );
  };

  if (loading) return <div className="loading">Loading story...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!story) return <div className="error-message">Story not found</div>;

  return (
    <div className="story-page-container">
      {/* Navigation Bar */}
      <div className="story-navbar">
        <div className="navbar-left">
          <button className="back-button" onClick={handleGoBack}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>

          <div className="app-logo"><h3>Lokstories</h3></div>
        </div>
        <div className="translate-button-container">
          <button 
            onClick={handleTranslate}
            disabled={translationLoading}
            className="translate-button"
          >
            {translationLoading ? 'Translating...' : 
             isTranslated ? 'Show Original' : 'Translate to Nepali'}
          </button>
        </div>
      </div>
      
      {/* Translation Loading Overlay */}
      {translationLoading && (
        <div className="full-page-overlay">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-message">
              <p>Loading translation...</p>
              <p className="loading-subtext">This might take a few seconds</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Thank You Popup */}
      {showThankYouPopup && (
        <div className="success-popup thank-you-popup">
          <div className="success-content">
            <div className="success-icon">✓</div>
            <h3>Thank You!</h3>
            <p>Your rating has been submitted successfully.</p>
          </div>
        </div>
      )}

      {/* Delete Comment Confirmation Popup */}
      {showDeleteConfirmation && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-popup">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this comment?</p>
            <p className="delete-warning">This action cannot be undone!</p>
            <div className="delete-confirmation-buttons">
              <button onClick={cancelDeleteComment} className="cancel-delete-button">Cancel</button>
              <button onClick={confirmDeleteComment} className="confirm-delete-button">Delete</button>
            </div>
          </div>
        </div>
      )}
    
      <div className="story-page">
        <div className="story-actions">
          <div className="rating-container">
            <div className="rating-display">
              <div className="average-rating">
                <span className="rating-value">
                {story.avg_rating?.toFixed(1) || '0.0'}
                </span>
                <span className="rating-max">/5</span>
              </div>
              {story.rating_count > 0 && (
                <div className="rating-count">
                ({story.rating_count} {story.rating_count === 1 ? 'rating' : 'ratings'})
                </div>
              )}
            </div>
            <button 
              onClick={openRatingPopup} 
              className="rate-button"
              disabled={!userId} // Disable if user not logged in
            >
              {hasRated ? 'Update Rating' : 'Rate This Story'}
            </button>
          </div>
        </div>

        {/* Rating Popup */}
        {showRatingPopup && (
          <div className="rating-popup-overlay">
            <div className="rating-popup">
              <div className="rating-popup-header">
                <h3>{hasRated ? 'Update Your Rating' : 'Rate This Story'}</h3>
                <button onClick={closeRatingPopup} className="close-button">×</button>
              </div>
              <div className="rating-popup-content">
                <p>Select your rating for "{getText('title')}"</p>
                <StarRating totalStars={5} />
                <div className="rating-value-text">
                  {userRating > 0 ? `Your rating: ${userRating} stars` : 'Click to rate'}
                </div>
                <div className="rating-buttons">
                  <button 
                    onClick={handleRatingSubmit} 
                    disabled={userRating === 0 || ratingSubmitting}
                    className="submit-rating-button"
                  >
                    {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                  <button onClick={closeRatingPopup} className="cancel-button">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="story-header">
          <div className="story-info">
            <h1>{getText('title')}</h1>
            <p className="story-author">By: {story.author_name}</p>
            <p className="story-genre">Genre: {getText('genre')}</p>
            <div className="story-description">
              <h3>Description</h3>
              <p>{getText('description')}</p>
            </div>
          </div>
        </div>

        <div className="story-content">
          <h2>Story</h2>
          <div className="content-text">
            {getText('content')}
          </div>
        </div>

        {story.historic_site_name?.trim() && (
          <div className="story-historic-site">
            <h2>Historic Site Featured in This Story</h2>
            <div className="historic-site-details">
              <h3>{getText('historic_site_name')}</h3>
              <p>{getText('historic_site_description')}</p>
              
              {story.historic_site_url && (
                <div className="map-container">
                  <h4>Location:</h4>
                  <iframe
                    src={mapUrl.historic || `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(story.historic_site_name || "Nepal")}`}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map of ${story.historic_site_name}`}
                  ></iframe>
                  <p className="map-fallback">
                    <a href={story.historic_site_url} target="_blank" rel="noopener noreferrer">
                      View on Google Maps
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {story.food_name?.trim() && (
          <div className="story-food-location">
            <h2>Food Location Featured in This Story</h2>
            <div className="food-location-details">
              <div className="food-info">
                <h3>{getText('food_name')}</h3>
                <h4>Available at: {getText('restaurant_name')}</h4>
                <p>{getText('food_description')}</p>
              </div>
              
              {story.restaurant_url && (
                <div className="map-container">
                  <h4>Restaurant Location:</h4>
                  <iframe
                    src={mapUrl.restaurant || `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(story.restaurant_name || "Nepal")}`}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map of ${story.restaurant_name}`}
                  ></iframe>
                  <p className="map-fallback">
                    <a href={story.restaurant_url} target="_blank" rel="noopener noreferrer">
                      View on Google Maps
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        

        <div className="comment-section">
          <h2>Comments</h2>
          
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add comment..."
              rows="2"
              required
              minLength="3"
            />
            <div className="comment-form-controls">
              
              <button type="submit" className="comment-submit-button">Submit</button>
            </div>
          </form>

          {commentsLoading ? (
            <div className="comments-loading">
              <div className="comment-loading-spinner"></div>
              <p>Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="no-comments">
              <div className="no-comments-icon">💬</div>
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="comments-list">
              <div className="comments-header">
                <span className="comments-count">{comments.length} Comments</span>
                <div className="comments-sort">
                  
                 
                </div>
              </div>
              
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">
                    {comment.profile_picture ? (
                      <img 
                        src={
                          comment.profile_picture.startsWith('http') 
                            ? comment.profile_picture 
                            : `http://localhost:8000${comment.profile_picture}`
                        } 
                        alt={`${comment.username}'s avatar`} 
                        className="avatar-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentNode.innerHTML = getDefaultAvatar(comment.username).props.children;
                        }}
                      />
                    ) : (
                      getDefaultAvatar(comment.username)
                    )}
                  </div>
                  <div className="comment-main">
                    <div className="comment-header">
                      <div className="comment-user-info">
                        <span className="comment-username">{comment.username}</span>
                        <span className="comment-time">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className='comment-delete'>
                    <div className="comment-content">{comment.content}</div>
                    <div className="comment-actions">
                      
                      {userId === comment.user && (
                        <button 
                          onClick={() => initiateDeleteComment(comment.id)}
                          className="comment-action-btn story-delete-btn"
                        >
                          Delete
                        </button>
                      )}
                        {/* Comment Added Success Popup */}
                        {showCommentSuccessPopup && (
                          <div className="success-popup comment-success">
                            <div className="success-content">
                              <div className="success-icon">✓</div>
                              <h3>Success!</h3>
                              <p>{commentActionMessage}</p>
                            </div>
                          </div>
                        )}

                        {/* Comment Deleted Success Popup */}
                        {showDeleteSuccessPopup && (
                          <div className="success-popup delete-success">
                            <div className="success-content">
                              <div className="success-icon">✓</div>
                              <h3>Success!</h3>
                              <p>{commentActionMessage}</p>
                            </div>
                          </div>
                        )}
                    </div></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryPage;