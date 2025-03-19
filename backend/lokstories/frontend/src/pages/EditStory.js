import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './UploadStory.css'; // Reuse the upload story styles

const EditStory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    genre: '',
    cover_image: null,
    // Added historic site fields
    historic_site_name: '',
    historic_site_description: '',
    historic_site_url: '',
    // Added food location fields
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

  useEffect(() => {
    const fetchStory = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/api/stories/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setFormData({
          title: response.data.title,
          content: response.data.content,
          description: response.data.description,
          genre: response.data.genre,
          // We don't set cover_image here because it's a file
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
        
        if (response.data.cover_image) {
          setImagePreview(`http://localhost:8000${response.data.cover_image}`);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch story details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchStory();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please login again.');
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

    // Append historic site fields - even if empty to match model structure
    data.append('historic_site_name', formData.historic_site_name || '');
    data.append('historic_site_description', formData.historic_site_description || '');
    data.append('historic_site_url', formData.historic_site_url || '');

    // Append food location fields - even if empty to match model structure
    data.append('food_name', formData.food_name || '');
    data.append('restaurant_name', formData.restaurant_name || '');
    data.append('food_description', formData.food_description || '');
    data.append('restaurant_url', formData.restaurant_url || '');

    console.log('Sending data to server:', Object.fromEntries(data.entries()));

    try {
      // Add timeout and better error handling
      await axios.put(`http://localhost:8000/stories/update/${id}/`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 15000 // 15 seconds timeout
      });
      
      setSubmitting(false);
      // Redirect to author's home page after successful update
      navigate('/authors-homepage');
    } catch (err) {
      setSubmitting(false);
      console.error('Full error:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Server may be down or overloaded.');
      } else if (!err.response) {
        setError('Network error. Check your connection and server status.');
      } else {
        // Try to get more detailed error info
        const errorData = err.response?.data;
        console.log('Error response data:', errorData);
        
        if (typeof errorData === 'object') {
          // If error data is an object, extract field errors
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          
          setError(fieldErrors || 'Unknown server error. Please try again.');
        } else {
          setError(err.response?.data?.detail || 'Failed to update story. Please try again.');
        }
      }
    }
  };

  const handleCancel = () => {
    navigate('/authors-homepage');
  };

  if (loading) return <div className="loading">Loading...</div>;

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
              placeholder="e.g. Fantasy, Mystery, Romance"
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
              rows="10"
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="cover_image">Cover Image</label>
            <input
              type="file"
              id="cover_image"
              name="cover_image"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Cover preview" />
                <p>Current cover image (leave empty to keep this image)</p>
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
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="historic_site_description">Historic Site Description</label>
                <textarea
                  id="historic_site_description"
                  name="historic_site_description"
                  value={formData.historic_site_description}
                  onChange={handleChange}
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
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="food_description">Food Description</label>
                <textarea
                  id="food_description"
                  name="food_description"
                  value={formData.food_description}
                  onChange={handleChange}
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
    </>
  );
};

export default EditStory;