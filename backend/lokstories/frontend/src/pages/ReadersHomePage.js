import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ReadersHomePage.css';

const ReadersHomePage = () => {
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    profile_picture: null,
    name: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the list of stories when the component mounts
    axios.get('http://localhost:8000/api/stories/')
      .then(response => {
        setStories(response.data);
        setFilteredStories(response.data); // Initialize filtered stories
      })
      .catch(err => {
        setError('Failed to fetch stories');
        console.error(err);
      });
    
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      axios.get('http://localhost:8000/api/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        setProfile(response.data);
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
      });
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      setFilteredStories(stories);
    } else {
      const filtered = stories.filter(story => 
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.author_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStories(filtered);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRefresh = () => {
    // Clear search query and reset to all stories
    setSearchQuery('');
    setFilteredStories(stories);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/');
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      <header className="site-header">
        <div className="header-left">
          <button onClick={handleBackClick} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="site-logo">LOKSTORIES</div>
        </div>
        <div className="user-nav">
          <div className="search-container">
            <div className="search-bar">
              <span className="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="Search stories or authors" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <button className="refresh-button" onClick={handleRefresh} title="Refresh all books">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
              </svg>
            </button>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Logout</span>
          </button>
          <Link to="/profile" className="profile-link">
            {profile.profile_picture ? (
              <img 
                src={`http://localhost:8000${profile.profile_picture}`} 
                alt="Profile" 
                className="user-avatar" 
              />
            ) : (
              <div className="user-avatar-placeholder">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </Link>
        </div>
      </header>

      <div className="readers-homepage">
        <h1>Explore Books</h1>
        
        <div className="story-list">
          {filteredStories.length > 0 ? (
            filteredStories.map((story) => (
              <Link to={`/stories/${story.id}`} key={story.id} className="story-link">
                <div className="story-card">
                  <img
                    src={story.cover_image}
                    alt={story.title}
                    className="story-cover"
                  />
                  <h3>{story.title}</h3>
                  <p className="story-author">By: {story.author_name}</p>
                  <p className="story-genre">Genre: {story.genre}</p>
                  <p>{story.description}</p>
                </div>
              </Link>
            ))
          ) : (
            <p>{searchQuery ? 'No matching stories found' : 'No stories available'}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ReadersHomePage;