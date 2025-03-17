import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './StoryPage.css';

const StoryPage = () => {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // This gets the story ID from the URL

  useEffect(() => {
    // Fetch the story details when the component mounts
    axios.get(`http://localhost:8000/api/stories/${id}/`)
      .then(response => {
        setStory(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch story details');
        setLoading(false);
        console.error(err);
      });
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!story) return <div className="error-message">Story not found</div>;

  return (
    <div className="story-page">
      <div className="story-header">
        <img 
          src={`http://localhost:8000${story.cover_image}`} 
          alt={story.title} 
          className="story-cover-large"
        />
        <div className="story-info">
          <h1>{story.title}</h1>
          <p className="story-author">By: {story.author_name}</p>
          <p className="story-genre">Genre: {story.genre}</p>
          <div className="story-description">
            <h3>Description</h3>
            <p>{story.description}</p>
          </div>
        </div>
      </div>
      
      <div className="story-content">
        <h2>Story</h2>
        <div className="content-text">
          {story.content}
        </div>
      </div>
    </div>
  );
};

export default StoryPage;