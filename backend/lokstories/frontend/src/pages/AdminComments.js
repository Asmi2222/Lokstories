import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

const AdminComments = () => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/comments/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setComments(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      setError('Failed to load comments. Please make sure you have admin privileges.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchComments();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleDeleteComment = (commentId, content) => {
    setCommentToDelete({ id: commentId, content: content });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/admin/comments/delete/${commentToDelete.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setComments(comments.filter(comment => comment.id !== commentToDelete.id));
      setShowDeleteConfirm(false);
      setCommentToDelete(null);
    } catch (err) {
      setError('Failed to delete comment. Please try again.');
      setShowDeleteConfirm(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <div className="loading">Loading comments...</div>;
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
            <li>
              <Link to="/admin/stories">
                <i className="fas fa-book"></i>
                <span>Stories</span>
              </Link>
            </li>
            <li className="active">
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
            <h1>Manage Comments</h1>
          </div>
          <div className="header-actions">
            <button onClick={handleGoBack} className="admin-back-button">
              <i className="fas fa-arrow-left btn"></i>  Back
            </button>
            <button onClick={handleRefresh} className="refresh-button" disabled={refreshing}>
              <i className="fas fa-sync-alt"></i> {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={handleLogout} className="logout-button">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </header>

        {/* Comments Table */}
        <div className="admin-content-section">
          <div className="comments-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Comment</th>
                  <th>Story</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map(comment => (
                  <tr key={comment.id}>
                    <td>{comment.id}</td>
                    <td>
                      {comment.content.length > 50 ? comment.content.substring(0, 50) + '...' : comment.content}
                    </td>
                    <td>{comment.story_title}</td>
                    <td>{comment.username}</td>
                    <td>{formatDate(comment.created_at)}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteComment(comment.id, comment.content)}
                        className="delete-btn"
                      >
                        <i className="fas fa-trash-alt"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {comments.length === 0 && (
              <div className="no-data">No comments found.</div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && commentToDelete && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <div className="confirmation-header">
                <h3>Confirm Deletion</h3>
              </div>
              <div className="confirmation-body">
                <div className="warning-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <p>Are you sure you want to delete this comment?</p>
                <div className="comment-preview">
                  "{commentToDelete.content.length > 50 ? commentToDelete.content.substring(0, 50) + '...' : commentToDelete.content}"
                </div>
                <p className="warning-text">This action cannot be undone!</p>
              </div>
              <div className="confirmation-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCommentToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-delete-btn"
                  onClick={confirmDelete}
                >
                  Delete Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComments;