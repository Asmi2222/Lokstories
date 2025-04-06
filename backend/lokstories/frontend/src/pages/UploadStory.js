import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UploadStory.css';

const UploadStory = () => {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showHistoricSiteFields, setShowHistoricSiteFields] = useState(false);
  const [showFoodFields, setShowFoodFields] = useState(false);
  const [genres] = useState([
    'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 
    'Adventure', 'Historical Fiction', 'Horror', 'Literary Fiction', 'Other'
  ]);

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
      
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please login again.');
      setLoading(false);
      return;
    }

    const data = new FormData();
    
    // Required fields
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('description', formData.description);
    data.append('genre', formData.genre);
    if (formData.cover_image) {
      data.append('cover_image', formData.cover_image);
    }

    // Append historic site fields
    data.append('historic_site_name', formData.historic_site_name || '');
    data.append('historic_site_description', formData.historic_site_description || '');
    data.append('historic_site_url', formData.historic_site_url || '');

    // Append food location fields
    data.append('food_name', formData.food_name || '');
    data.append('restaurant_name', formData.restaurant_name || '');
    data.append('food_description', formData.food_description || '');
    data.append('restaurant_url', formData.restaurant_url || '');

    try {
      const response = await axios.post('http://localhost:8000/stories/create/', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 15000
      });
      
      setLoading(false);
      navigate('/authors-homepage');
    } catch (err) {
      setLoading(false);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Server may be down or overloaded.');
      } else if (!err.response) {
        setError('Network error. Check your connection and server status.');
      } else {
        const errorData = err.response?.data;
        
        if (typeof errorData === 'object') {
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          
          setError(fieldErrors || 'Unknown server error. Please try again.');
        } else {
          setError(err.response?.data?.detail || 'Failed to upload story. Please try again.');
        }
      }
    }
  };

  const handleCancel = () => {
    navigate('/authors-homepage');
  };

  useEffect(() => {
    const testConnection = async () => {
      try {
        await axios.get('http://localhost:8000/', { timeout: 5000 });
      } catch (err) {
        if (!err.response) {
          setError('Warning: Could not connect to server. Server may be down or unavailable.');
        }
      }
    };
    
    testConnection();
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="site-logo">LOKSTORIES</div>
      </header>
      
      <div className="upload-story-container">
        <div className="page-header">
          <h1>Upload New Story</h1>
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
          
          <div className="form-group">
            <label htmlFor="cover_image">Cover Image</label>
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Cover preview" />
                <button 
                  type="button" 
                  className="cover-image-button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({...formData, cover_image: null});
                  }}
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  id="cover_image"
                  name="cover_image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label htmlFor="cover_image" className="cover-image-button">
                  Choose Cover Image
                </label>
              </>
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
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Story'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UploadStory;