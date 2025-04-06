import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ReadersHomePage.css';

const ReadersHomePage = () => {
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

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
  }, []);  

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

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      <header className="site-header">
        <div className="site-logo">LOKSTORIES</div>
        <div className="user-nav">
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
            <button className="search-button" onClick={handleSearch}>
              Search
            </button>
          </div>
          <Link to="/profile" className="profile-link">My Profile</Link>
          <div className="user-avatar">
            <img src="/api/placeholder/36/36" alt="User" />
          </div>
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