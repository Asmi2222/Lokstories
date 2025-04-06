import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './StoryPage.css';

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
  
  // Rating states
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  
  const { id } = useParams();
  const userId = parseInt(localStorage.getItem('user_id'));

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
    } catch (err) {
      console.error('Failed to submit comment:', err);
      alert(err.response?.data?.detail || 'Failed to post comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await axios.delete(`http://localhost:8000/api/comments/${commentId}/`);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert(err.response?.data?.detail || 'You can only delete your own comments');
    }
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
  
      alert("Thank you for rating this story!");
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

  const getEmbeddableMapUrl = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') return null;
    
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(url)}`;
    }
    
    if (url.includes('google.com/maps')) {
      if (url.includes('/maps/embed/')) return url;
      
      const placeMatch = url.match(/place\/([^\/]+)/);
      const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      
      if (placeMatch?.[1]) {
        return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${placeMatch[1]}`;
      } else if (coordMatch?.[1] && coordMatch?.[2]) {
        return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${coordMatch[1]},${coordMatch[2]}&zoom=15`;
      }
      return url.replace('/maps/', '/maps/embed/');
    }
    
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(url)}`;
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

  if (loading) return <div className="loading">Loading story...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!story) return <div className="error-message">Story not found</div>;

  return (
    <div className="story-page">
      <div className="story-actions">
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

      {/* Rest of your component remains the same */}
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
                  src={getEmbeddableMapUrl(story.historic_site_url)}
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
                  src={getEmbeddableMapUrl(story.restaurant_url)}
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
        <h3>Comments</h3>
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows="4"
            required
            minLength="3"
          />
          <button type="submit">Submit</button>
        </form>

        {commentsLoading ? (
          <div className="loading">Loading comments...</div>
        ) : comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-content">{comment.content}</div>
                <div className="comment-meta">
                  <span>By {comment.username}</span>
                  <span>{new Date(comment.created_at).toLocaleString()}</span>
                  {userId === comment.user && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="delete-comment-btn"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryPage;