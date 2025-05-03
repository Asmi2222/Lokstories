import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UploadStory.css';
import Notification from './Notification'; // Import Notification component

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
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [genres] = useState([
    'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 
    'Adventure', 'Historical Fiction', 'Horror', 'Literary Fiction', 'Other'
  ]);

  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

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
      
      // Clear any previous image error
      if (formErrors.cover_image) {
        setFormErrors({
          ...formErrors,
          cover_image: null
        });
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;
    
    // Validate required fields
    if (!formData.title.trim()) {
      errors.title = "Title is required";
      isValid = false;
    }
    
    if (!formData.genre.trim()) {
      errors.genre = "Genre is required";
      isValid = false;
    }
    
    if (!formData.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }
    
    if (!formData.content.trim()) {
      errors.content = "Story content is required";
      isValid = false;
    }
    
    // Check if cover image is provided
    if (!formData.cover_image) {
      errors.cover_image = "Cover image is required";
      setShowModal(true);
      isValid = false;
    }
    
    // URL validation for historic site
    if (showHistoricSiteFields && formData.historic_site_url && !isValidUrl(formData.historic_site_url)) {
      errors.historic_site_url = "Please enter a valid URL (e.g., https://example.com)";
      isValid = false;
    }
    
    // URL validation for restaurant
    if (showFoodFields && formData.restaurant_url && !isValidUrl(formData.restaurant_url)) {
      errors.restaurant_url = "Please enter a valid URL (e.g., https://example.com)";
      isValid = false;
    }
    
    // Check if terms are agreed to
    if (!termsAgreed) {
      errors.terms = "You must agree to the terms and conditions before submitting";
      setNotification({
        message: 'You must agree to the terms and conditions before submitting.',
        type: 'error'
      });
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // URL validation helper function
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent default browser validation
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      // Show first error as notification
      const firstError = Object.values(formErrors).find(error => error);
      if (firstError) {
        setNotification({
          message: firstError,
          type: 'error'
        });
      }
      return;
    }
    
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
      
      // Navigate with notification state
      navigate('/authors-homepage', { 
        state: { 
          notification: {
            message: 'Story uploaded successfully!',
            type: 'success'
          }
        }
      });
    } catch (err) {
      setLoading(false);
      
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
        const errorData = err.response?.data;
        
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
          setError(err.response?.data?.detail || 'Failed to upload story. Please try again.');
          setNotification({
            message: err.response?.data?.detail || 'Failed to upload story. Please try again.',
            type: 'error'
          });
        }
      }
    }
  };

  const handleCancel = () => {
    navigate('/authors-homepage');
  };
  
  const handleGoBack = () => {
    navigate('/authors-homepage');
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
  };

  const handleNotificationClose = () => {
    setNotification(null);
  };
  
  const openTermsModal = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

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
          <div className="site-logo ">Lokstories</div>
        </div>
      </header>
      
      <div className="upload-story-container">
        <div className="page-header">
          <h1>Upload New Story</h1>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="upload-form" noValidate>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter your story title"
              className={formErrors.title ? "error-input" : ""}
            />
            {formErrors.title && <div className="field-error">{formErrors.title}</div>}
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
              className={formErrors.genre ? "error-input" : ""}
            />
            {formErrors.genre && <div className="field-error">{formErrors.genre}</div>}
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
              className={formErrors.description ? "error-input" : ""}
            ></textarea>
            {formErrors.description && <div className="field-error">{formErrors.description}</div>}
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
              className={formErrors.content ? "error-input" : ""}
            ></textarea>
            {formErrors.content && <div className="field-error">{formErrors.content}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="cover_image">
              Cover Image <span className="file-requirements">(Max: 2MB, Formats: JPEG, PNG)</span>
            </label>
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
                  className={formErrors.cover_image ? "error-input" : ""}
                />
                <label htmlFor="cover_image" className={`cover-image-button ${formErrors.cover_image ? "error-button" : ""}`}>
                  Choose Cover Image
                </label>
                {formErrors.cover_image && <div className="field-error">{formErrors.cover_image}</div>}
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
                  type="text"
                  id="historic_site_url"
                  name="historic_site_url"
                  value={formData.historic_site_url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className={formErrors.historic_site_url ? "error-input" : ""}
                />
                {formErrors.historic_site_url && <div className="field-error">{formErrors.historic_site_url}</div>}
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
                  type="text"
                  id="restaurant_url"
                  name="restaurant_url"
                  value={formData.restaurant_url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className={formErrors.restaurant_url ? "error-input" : ""}
                />
                {formErrors.restaurant_url && <div className="field-error">{formErrors.restaurant_url}</div>}
              </div>
            </div>
          )}
          
          {/* Terms and Conditions Agreement */}
          <div className="form-group terms-agreement">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={termsAgreed}
                onChange={() => {
                  setTermsAgreed(!termsAgreed);
                  if (formErrors.terms) {
                    setFormErrors({
                      ...formErrors,
                      terms: null
                    });
                  }
                }}
                className={formErrors.terms ? "error-checkbox" : ""}
              />
              <label htmlFor="terms-checkbox" className={`checkbox-label ${formErrors.terms ? "error-label" : ""}`}>
                I certify that this content is original, created by me, and does not contain plagiarized material.
                I have properly credited all sources used in the creation of this work.{' '}
                <a href="#" onClick={openTermsModal}>Read full terms and conditions</a>
              </label>
            </div>
            {formErrors.terms && <div className="field-error terms-error">{formErrors.terms}</div>}
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
      
      {/* Modal Popup for Cover Image */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V12" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16H12.01" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Missing Cover Image
            </div>
            <div className="modal-body">
              Please upload a cover image for your story. A cover image helps attract readers and makes your story stand out.
            </div>
            <div className="modal-actions">
              <button className="modal-button" onClick={closeModal}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={closeTermsModal}>
          <div className="modal-content terms-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#f5840c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16H12.01" stroke="#f5840c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V12" stroke="#f5840c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Terms and Conditions
            </div>
            <div className="modal-body terms-body">
              <h4>Content Ownership and Copyright</h4>
              <p>By uploading a story to Lokstories, you confirm that:</p>
              <ol>
                <li>You are the original author of the content or have all necessary rights to publish it.</li>
                <li>The content does not infringe on any intellectual property rights, including copyright, trademark, or patent rights of any third party.</li>
                <li>You have properly attributed and cited any sources, references, or inspirations used in the creation of your work.</li>
                <li>You understand that plagiarism or unauthorized use of others' content is strictly prohibited.</li>
              </ol>
              
              <h4>Content Guidelines</h4>
              <p>You agree that your story:</p>
              <ol>
                <li>Does not contain content that is defamatory, libelous, or fraudulent.</li>
                <li>Does not violate any applicable laws or regulations.</li>
                <li>Does not contain content that promotes discrimination, hate speech, or violence.</li>
                <li>Properly credits historic sites, food locations, and other referenced places or establishments.</li>
              </ol>
              
              <h4>Violations and Consequences</h4>
              <p>You understand that:</p>
              <ol>
                <li>Lokstories reserves the right to remove content that violates these terms.</li>
                <li>Repeated violations may result in account termination.</li>
                <li>You may be held legally responsible for any copyright infringement or other legal violations in your content.</li>
              </ol>
              
              <h4>License Grant</h4>
              <p>By submitting your story, you grant Lokstories a non-exclusive license to display, promote, and share your content on our platform while you retain all ownership rights to your original work.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-button" 
                onClick={() => {
                  setTermsAgreed(true);
                  closeTermsModal();
                }}
              >
                I Agree
              </button>
              <button 
                className="modal-button-secondary" 
                onClick={closeTermsModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default UploadStory;