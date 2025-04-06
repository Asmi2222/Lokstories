import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Admin.css';

const AdminStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/stories/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStories(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load stories. Please make sure you have admin privileges.');
      setLoading(false);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/admin/stories/delete/${storyId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setStories(stories.filter(story => story.id !== storyId));
      } catch (err) {
        setError('Failed to delete story. Please try again.');
      }
    }
  };

  const handleViewStory = (story) => {
    setSelectedStory(story);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStory(null);
  };

  if (loading) return <div>Loading stories...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-container">
      <h1 className="admin-title">Manage Stories</h1>
      
      <Link to="/dashboard" className="back-link">
        ← Back to Dashboard
      </Link>

      <div className="stories-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Genre</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stories.map(story => (
              <tr key={story.id}>
                <td>{story.id}</td>
                <td>
                  <span 
                    className="story-title-link"
                    onClick={() => handleViewStory(story)}
                  >
                    {story.title}
                  </span>
                </td>
                <td>{story.author_name}</td>
                <td>{story.genre || 'Uncategorized'}</td>
                <td>{story.avg_rating ? story.avg_rating.toFixed(1) : '0.0'} ({story.rating_count || 0})</td>
                <td>
                  <button
                    onClick={() => handleDeleteStory(story.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Story Detail Modal */}
      {showModal && selectedStory && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="story-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedStory.title}</h2>
              <span className="close-btn" onClick={closeModal}>&times;</span>
            </div>
            <div className="modal-body">
              <div className="story-meta">
                <p><strong>Author:</strong> {selectedStory.author_name}</p>
                <p><strong>Genre:</strong> {selectedStory.genre || 'Uncategorized'}</p>
                <p><strong>Rating:</strong> {selectedStory.avg_rating ? selectedStory.avg_rating.toFixed(1) : '0.0'} ({selectedStory.rating_count || 0} ratings)</p>
              </div>
              <div className="story-content">
                <h3>Description</h3>
                <p>{selectedStory.description}</p>
                <h3>Content</h3>
                <p>{selectedStory.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {stories.length === 0 && (
        <div className="no-data">No stories found.</div>
      )}
    </div>
  );
};

export default AdminStories;