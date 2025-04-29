import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './UploadStory.css'; // Reuse the upload story styles
import Notification from './Notification'; // Import Notification component

// Enhanced image handling styles with orange buttons
const coverImageStyles = {
  coverImageSection: {
    marginBottom: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '5px',
    padding: '15px',
    backgroundColor: '#f9f9f9'
  },
  imagePreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '10px'
  },
  imageActions: {
    marginTop: '10px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  changeImageButton: {
    backgroundColor: '#ff9800', // Changed to orange
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.3s'
  },
  addImageButton: {
    backgroundColor: '#ff9800', // Changed to orange
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.3s'
  },
  noImage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 0',
    color: '#7f8c8d'
  },
  fileInputContainer: {
    marginTop: '15px',
    padding: '10px',
    border: '1px dashed #bdc3c7',
    borderRadius: '4px',
    backgroundColor: '#ecf0f1'
  },
  fileHelpText: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginTop: '5px',
    textAlign: 'center'
  }
};

const EditStory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    genre: '',
    cover_image: null,
    historic_site_name: '',
    historic_site_description: '',
    historic_site_url: '',
    food_name: '',
    restaurant_name: '',
    food_description: '',
    restaurant_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showHistoricSiteFields, setShowHistoricSiteFields] = useState(false);
  const [showFoodFields, setShowFoodFields] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [notification, setNotification] = useState(null);

  // Added file size and type validation constants
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

  useEffect(() => {
    const fetchStory = async () => {
      const token = localStorage.getItem('token');
      const currentUserId = localStorage.getItem('user_id');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        setNotification({
          message: 'Authentication required. Please login again.',
          type: 'error'
        });
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/api/stories/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Check if the current user is the author of this story
        if (response.data.author !== parseInt(currentUserId)) {
          // If not the author, redirect to unauthorized page
          setNotification({
            message: 'You are not authorized to edit this story.',
            type: 'error'
          });
          navigate('/unauthorized');
          return;
        }
        
        setFormData({
          title: response.data.title,
          content: response.data.content,
          description: response.data.description,
          genre: response.data.genre,
          historic_site_name: response.data.historic_site_name || '',
          historic_site_description: response.data.historic_site_description || '',
          historic_site_url: response.data.historic_site_url || '',
          food_name: response.data.food_name || '',
          restaurant_name: response.data.restaurant_name || '',
          food_description: response.data.food_description || '',
          restaurant_url: response.data.restaurant_url || ''
        });
        
        // Show sections if they have data
        if (
          response.data.historic_site_name || 
          response.data.historic_site_description || 
          response.data.historic_site_url
        ) {
          setShowHistoricSiteFields(true);
        }
        
        if (
          response.data.food_name || 
          response.data.restaurant_name || 
          response.data.food_description ||
          response.data.restaurant_url
        ) {
          setShowFoodFields(true);
        }
        
        // Fix the image preview URL
        if (response.data.cover_image) {
          // Properly handle image URL
          const imageUrl = response.data.cover_image.startsWith('http') 
            ? response.data.cover_image 
            : `http://localhost:8000${response.data.cover_image}`;
          setImagePreview(imageUrl);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch story details.');
        setNotification({
          message: 'Failed to fetch story details.',
          type: 'error'
        });
        setLoading(false);
        console.error(err);
      }
    };

    fetchStory();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Updated handleImageChange with file size and type validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, JPG).');
        setNotification({
          message: 'Please select a valid image file (JPEG, PNG, JPG).',
          type: 'error'
        });
        return;
      }
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError('Cover image must be less than 2MB in size.');
        setNotification({
          message: 'Cover image must be less than 2MB in size.',
          type: 'error'
        });
        return;
      }
      
      setFormData({
        ...formData,
        cover_image: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Hide the file input after selecting a file
      setShowImageInput(false);
      
      // Show success notification for image change
      setNotification({
        message: 'Cover image updated. Don\'t forget to save your changes!',
        type: 'success'
      });
    }
  };

  const toggleImageInput = () => {
    setShowImageInput(!showImageInput);
    
    // Focus on the file input when it becomes visible
    if (!showImageInput) {
      setTimeout(() => {
        const fileInput = document.getElementById('cover_image');
        if (fileInput) {
          fileInput.focus();
          // Try to simulate a click (some browsers might block this for security)
          try {
            fileInput.click();
          } catch (e) {
            console.log('Auto-click on file input was blocked');
          }
        }
      }, 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please login again.');
      setNotification({
        message: 'Authentication required. Please login again.',
        type: 'error'
      });
      setSubmitting(false);
      return;
    }

    // Create FormData object to handle file uploads
    const data = new FormData();
    
    // Required fields
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('description', formData.description);
    data.append('genre', formData.genre);
    if (formData.cover_image) {
      data.append('cover_image', formData.cover_image);
    }

    // Append other fields
    data.append('historic_site_name', formData.historic_site_name || '');
    data.append('historic_site_description', formData.historic_site_description || '');
    data.append('historic_site_url', formData.historic_site_url || '');
    data.append('food_name', formData.food_name || '');
    data.append('restaurant_name', formData.restaurant_name || '');
    data.append('food_description', formData.food_description || '');
    data.append('restaurant_url', formData.restaurant_url || '');

    console.log('Sending data to server:', Object.fromEntries(data.entries()));

    try {
      // IMPORTANT: Use the correct endpoint URL
      // Try the first endpoint format
      await axios.put(`http://localhost:8000/stories/update/${id}/`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 15000 // 15 seconds timeout
      });
      
      setSubmitting(false);
      // Navigate with notification state
      navigate('/authors-homepage', { 
        state: { 
          notification: {
            message: 'Story updated successfully!',
            type: 'success'
          }
        }
      });
    } catch (firstErr) {
      // If the first endpoint fails, try the second format
      try {
        await axios.put(`http://localhost:8000/api/stories/${id}/update/`, data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 15000
        });
        
        setSubmitting(false);
        // Navigate with notification state
        navigate('/authors-homepage', { 
          state: { 
            notification: {
              message: 'Story updated successfully!',
              type: 'success'
            }
          }
        });
      } catch (err) {
        handleSubmitError(err);
      }
    }
  };

  const handleSubmitError = (err) => {
    setSubmitting(false);
    console.error('Full error:', err);
    
    if (err.code === 'ECONNABORTED') {
      setError('Request timed out. Server may be down or overloaded.');
      setNotification({
        message: 'Request timed out. Server may be down or overloaded.',
        type: 'error'
      });
    } else if (!err.response) {
      setError('Network error. Check your connection and server status.');
      setNotification({
        message: 'Network error. Check your connection and server status.',
        type: 'error'
      });
    } else {
      // Try to get more detailed error info
      const errorData = err.response?.data;
      console.log('Error response data:', errorData);
      
      if (typeof errorData === 'object') {
        const fieldErrors = Object.entries(errorData)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        
        setError(fieldErrors || 'Unknown server error. Please try again.');
        setNotification({
          message: fieldErrors || 'Unknown server error. Please try again.',
          type: 'error'
        });
      } else {
        setError(err.response?.data?.detail || 'Failed to update story. Please try again.');
        setNotification({
          message: err.response?.data?.detail || 'Failed to update story. Please try again.',
          type: 'error'
        });
      }
    }
  };

  const handleCancel = () => {
    navigate('/authors-homepage');
  };
  
  const handleGoBack = () => {
    navigate('/authors-homepage');
  };

  const handleNotificationClose = () => {
    setNotification(null);
  };

  // Server connection test 
  useEffect(() => {
    const testConnection = async () => {
      try {
        await axios.get('http://localhost:8000/', { timeout: 5000 });
      } catch (err) {
        if (!err.response) {
          setError('Warning: Could not connect to server. Server may be down or unavailable.');
          setNotification({
            message: 'Warning: Could not connect to server. Server may be down or unavailable.',
            type: 'warning'
          });
        }
      }
    };
    
    testConnection();
  }, []);

  if (loading) return <div className="loading-indicator">Loading...</div>;

  return (
    <>
     <div className='uploadStory'>
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
          <button onClick={handleGoBack} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="site-logo">Lokstories</div>
        </div>
      </header>

      <div className="upload-story-container">
        <div className="page-header">
          <h1>Edit Story</h1>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter your story title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="genre">Genre</label>
            <input
              type="text"
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              placeholder="Enter a genre"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Short Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Briefly describe your story (will appear in previews)"
              rows="3"
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Story Content</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your story here..."
              rows="10"
              required
            ></textarea>
          </div>
          
          {/* Enhanced Cover Image Section with Orange Buttons + File Size Notification */}
          <div className="form-group" style={coverImageStyles.coverImageSection}>
            <label htmlFor="cover_image">
              Cover Image <span className="file-requirements">(Max: 2MB, Formats: JPEG, PNG)</span>
            </label>
            
            {imagePreview ? (
              <div style={coverImageStyles.imagePreview}>
                <img src={imagePreview} alt="Cover preview" style={{maxWidth: '100%', maxHeight: '300px'}} />
                
                <div style={coverImageStyles.imageActions}>
                  <button 
                    type="button" 
                    style={coverImageStyles.changeImageButton}
                    onClick={toggleImageInput}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e67e22'} // Darker orange on hover
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff9800'} // Back to normal orange
                  >
                    {showImageInput ? 'Cancel' : 'Change Cover Image'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={coverImageStyles.noImage}>
                <p>No cover image available</p>
                <button
                  type="button"
                  style={coverImageStyles.addImageButton}
                  onClick={toggleImageInput}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e67e22'} // Darker orange on hover
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff9800'} // Back to normal orange
                >
                  Add Cover Image
                </button>
              </div>
            )}
            
            {showImageInput && (
              <div style={coverImageStyles.fileInputContainer}>
                <input
                  type="file"
                  id="cover_image"
                  name="cover_image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <p style={coverImageStyles.fileHelpText}>
                  Select a new image to replace the current cover (Max: 2MB, JPEG, PNG only)
                </p>
              </div>
            )}
          </div>
          
          {/* Historic Site Fields Toggle */}
          <div className="form-section-toggle">
            <button 
              type="button" 
              className="toggle-button"
              onClick={() => setShowHistoricSiteFields(!showHistoricSiteFields)}
            >
              {showHistoricSiteFields ? 'Hide Historic Site Details' : 'Add Historic Site Details'}
            </button>
          </div>
          
          {/* Historic Site Fields */}
          {showHistoricSiteFields && (
            <div className="form-section historic-site-section">
              <h3>Historic Site Details</h3>
              
              <div className="form-group">
                <label htmlFor="historic_site_name">Historic Site Name</label>
                <input
                  type="text"
                  id="historic_site_name"
                  name="historic_site_name"
                  value={formData.historic_site_name}
                  onChange={handleChange}
                  placeholder="Name of the historic site"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="historic_site_description">Historic Site Description</label>
                <textarea
                  id="historic_site_description"
                  name="historic_site_description"
                  value={formData.historic_site_description}
                  onChange={handleChange}
                  placeholder="Describe the historic site and its significance"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="historic_site_url">Historic Site URL</label>
                <input
                  type="url"
                  id="historic_site_url"
                  name="historic_site_url"
                  value={formData.historic_site_url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          )}
          
          {/* Food Location Fields Toggle */}
          <div className="form-section-toggle">
            <button 
              type="button" 
              className="toggle-button"
              onClick={() => setShowFoodFields(!showFoodFields)}
            >
              {showFoodFields ? 'Hide Food Location Details' : 'Add Food Location Details'}
            </button>
          </div>
          
          {/* Food Location Fields */}
          {showFoodFields && (
            <div className="form-section food-section">
              <h3>Food Location Details</h3>
              
              <div className="form-group">
                <label htmlFor="food_name">Food Name</label>
                <input
                  type="text"
                  id="food_name"
                  name="food_name"
                  value={formData.food_name}
                  onChange={handleChange}
                  placeholder="Name of the dish or food"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="restaurant_name">Restaurant Name</label>
                <input
                  type="text"
                  id="restaurant_name"
                  name="restaurant_name"
                  value={formData.restaurant_name}
                  onChange={handleChange}
                  placeholder="Name of the restaurant or eatery"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="food_description">Food Description</label>
                <textarea
                  id="food_description"
                  name="food_description"
                  value={formData.food_description}
                  onChange={handleChange}
                  placeholder="Describe the food and its significance"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="restaurant_url">Restaurant URL</label>
                <input
                  type="url"
                  id="restaurant_url"
                  name="restaurant_url"
                  value={formData.restaurant_url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Story'}
            </button>
          </div>
        </form>
      </div>
     </div>
    </>
  );
};

export default EditStory;