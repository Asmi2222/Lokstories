import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making API requests
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirecting after registration
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    role: "Reader", // Set default role to "reader"
    password: "",
    confirmPassword: ""
  });

  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', formData);
      
      if (response.status === 201) {
        // Redirect to login page after successful registration
        navigate('/');
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1 className="login-heading">Create Account</h1>
          <p className="login-subheading">Sign up for a new account</p>
          
          <div className="form-row">
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-container">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-container">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <div className="input-container">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 13C14.7614 13 17 10.7614 17 8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8C7 10.7614 9.23858 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 21C20 19.4087 19.3679 17.8826 18.2426 16.7574C17.1174 15.6321 15.5913 15 14 15H10C8.4087 15 6.88258 15.6321 5.75736 16.7574C4.63214 17.8826 4 19.4087 4 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="role-select"
              >
                <option value="Reader">Reader</option>
                <option value="Author">Author</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-container">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-container">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          <button type="submit" className="login-button">
            Create Account
          </button>
          
          <div className="signup-link">
            <p>Already have an account? <a href="/">Sign In</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
