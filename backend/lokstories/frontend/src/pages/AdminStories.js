import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

const AdminStories = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/stories/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStories(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      setError('Failed to load stories. Please make sure you have admin privileges.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchStories();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleDeleteStory = (storyId, storyTitle) => {
    setStoryToDelete({ id: storyId, title: storyTitle });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/admin/stories/delete/${storyToDelete.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStories(stories.filter(story => story.id !== storyToDelete.id));
      setShowDeleteConfirm(false);
      setStoryToDelete(null);
    } catch (err) {
      setError('Failed to delete story. Please try again.');
      setShowDeleteConfirm(false);
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

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) return <div className="loading">Loading stories...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-app-container">
      {/* Sidebar Navigation */}
      <div className="admin-sidebar">
        <div className="logo-container">
          <h2>Lokstories</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/dashboard">
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/users">
                <i className="fas fa-users"></i>
                <span>Users</span>
              </Link>
            </li>
            <li className="active">
              <Link to="/admin/stories">
                <i className="fas fa-book"></i>
                <span>Stories</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/comments">
                <i className="fas fa-comments"></i>
                <span>Comments</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="admin-main-content">
        {/* Header with title and logout */}
        <header className="admin-header">
          <div className="header-title">
            <h1>Manage Stories</h1>
          </div>
          <div className="header-actions">
            <button onClick={handleGoBack} className="admin-back-button">
              <i className="fas fa-arrow-left btn"></i> Back
            </button>
            <button onClick={handleRefresh} className="refresh-button" disabled={refreshing}>
              <i className="fas fa-sync-alt"></i> {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={handleLogout} className="logout-button">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </header>

        {/* Stories Table */}
        <div className="admin-content-section">
          <div className="stories-table-container">
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
                        onClick={() => handleViewStory(story)}
                        className="view-btn"
                      >
                        <i className="fas fa-eye"></i> View
                      </button>
                      <button
                        onClick={() => handleDeleteStory(story.id, story.title)}
                        className="delete-btn"
                      >
                        <i className="fas fa-trash-alt"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {stories.length === 0 && (
              <div className="no-data">No stories found.</div>
            )}
          </div>
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && storyToDelete && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <div className="confirmation-header">
                <h3>Confirm Deletion</h3>
              </div>
              <div className="confirmation-body">
                <div className="warning-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <p>Are you sure you want to delete the story "{storyToDelete.title}"?</p>
                <p className="warning-text">This action cannot be undone!</p>
              </div>
              <div className="confirmation-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setStoryToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-delete-btn"
                  onClick={confirmDelete}
                >
                  Delete Story
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStories;