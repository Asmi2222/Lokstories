import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
      navigate('/login');
      return;
    }
    
    // Set default headers for all requests
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        // Use the same base URL format as in StoryPage.js
        const response = await axios.get('http://localhost:8000/api/profile/');
        
        setProfile(response.data);
        if (response.data.profile_picture) {
          setPreviewImage(response.data.profile_picture);
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
      const token = localStorage.getItem('token');
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfile(response.data);
      setIsEditing(false);
      setLoading(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2>My Profile</h2>
              {!isEditing && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
            <div className="card-body">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                 
                    
                  
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={profile.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.role}
                      disabled
                    />
                    <small className="text-muted">Role cannot be changed</small>
                  </div>
                  
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => {
                        setIsEditing(false);
                        setPreviewImage(profile.profile_picture);
                        setNewImage(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  
                  
                  <div className="row mb-3">
                    <div className="col-md-3 fw-bold">Username:</div>
                    <div className="col-md-9">{profile.username}</div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-3 fw-bold">Full Name:</div>
                    <div className="col-md-9">{profile.name}</div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-3 fw-bold">Role:</div>
                    <div className="col-md-9">{profile.role}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;