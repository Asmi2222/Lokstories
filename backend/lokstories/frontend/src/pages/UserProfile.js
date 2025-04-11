import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './UserProfile.css';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    username: '',
    name: '',
    role: '',
    profile_picture: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [newImage, setNewImage] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get the JWT token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/');
      return;
    }
    
    // Set default headers for all requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/profile/');
        
        setProfile(response.data);
        if (response.data.profile_picture) {
          setPreviewImage(`http://localhost:8000${response.data.profile_picture}`);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      
      // Add form fields to FormData
      formData.append('username', profile.username);
      formData.append('name', profile.name);
      
      // Add new image if selected
      if (newImage) {
        formData.append('profile_picture', newImage);
      }
      
      const response = await axios.put('http://localhost:8000/api/profile/update/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfile(response.data);
      if (response.data.profile_picture) {
        setPreviewImage(`http://localhost:8000${response.data.profile_picture}`);
      }
      setIsEditing(false);
      setLoading(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      setLoading(false);
    }
  };
  
  // Handle back button click
  const handleBack = () => {
    navigate(-1); // Navigate to the previous page in history
  };
  
  if (loading) {
    return (
      <div className="user-loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-card">
      {/* Header with gradient background and back button */}
      <div className="profile-header">
        <button className="back-btn" onClick={handleBack}>
          ← Back
        </button>
      </div>
      
      <div className="profile-content-wrapper">
        {/* Profile picture on the left with name below it */}
        <div className="profile-info-container">
          <div className="profile-left-section">
            <div className="profile-picture-container">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Profile" 
                  className="profile-picture"
                />
              ) : (
                <div className="profile-initial">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              
              {isEditing && (
                <button 
                  className="upload-btn"
                  onClick={() => document.getElementById('profile_picture').click()}
                >
                  Change Photo
                </button>
              )}
              <input
                type="file"
                id="profile_picture"
                className="hidden-input"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            
            <div className="profile-name">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  className="name-input"
                  value={profile.name}
                  onChange={handleChange}
                  required
                />
              ) : (
                <h2>{profile.name}</h2>
              )}
            </div>
          </div>
          
          {/* Personal Information Section below the name */}
          <div className="profile-content">
            <div className="profile-section-title">Personal Information</div>
            
            <div className="profile-field">
              <div className="field-label">Role</div>
              <div className="field-value">{profile.role}</div>
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="profile-field">
                  <div className="field-label">Username</div>
                  <input
                    type="text"
                    name="username"
                    className="field-input"
                    value={profile.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="btn-container">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setIsEditing(false);
                      if (profile.profile_picture) {
                        setPreviewImage(`http://localhost:8000${profile.profile_picture}`);
                      } else {
                        setPreviewImage(null);
                      }
                      setNewImage(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-field">
                  <div className="field-label">Username</div>
                  <div className="field-value">{profile.username}</div>
                </div>
                
                <div className="btn-container">
                  <button 
                    className="edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;