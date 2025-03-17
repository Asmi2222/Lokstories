import React, { useState } from 'react';
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
    cover_image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please login again.');
      setLoading(false);
      return;
    }

    // Create FormData object to handle file uploads
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('description', formData.description);
    data.append('genre', formData.genre);
    if (formData.cover_image) {
      data.append('cover_image', formData.cover_image);
    }

    try {
      await axios.post('http://localhost:8000/stories/create/', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setLoading(false);
      // Redirect to author's home page after successful upload
      navigate('/authors-homepage');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.detail || 'Failed to upload story. Please try again.');
      console.error('Error uploading story:', err);
    }
  };

  const handleCancel = () => {
    navigate('/authors-homepage');
  };

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
              </div>
            )}
          </div>
          
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