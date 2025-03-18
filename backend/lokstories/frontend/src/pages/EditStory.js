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
    cover_image: null
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
        });
        
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
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('description', formData.description);
    data.append('genre', formData.genre);
    if (formData.cover_image) {
      data.append('cover_image', formData.cover_image);
    }

    try {
      await axios.put(`http://localhost:8000/stories/update/${id}/`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSubmitting(false);
      // Redirect to author's home page after successful update
      navigate('/authors-homepage');
    } catch (err) {
      setSubmitting(false);
      setError(err.response?.data?.detail || 'Failed to update story. Please try again.');
      console.error('Error updating story:', err);
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