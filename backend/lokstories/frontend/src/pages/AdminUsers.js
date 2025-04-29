import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';
import Notification from './Notification';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/users/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      setError('Failed to load users. Please make sure you have admin privileges.');
      setLoading(false);
      setRefreshing(false);
      
      // Show error notification
      showNotification('Failed to load users. Please make sure you have admin privileges.', 'error');
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleDeleteUser = (userId, username) => {
    setUserToDelete({ id: userId, username: username });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/admin/users/delete/${userToDelete.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      
      // Show success notification
      showNotification(`User "${userToDelete.username}" has been successfully deleted.`, 'success');
    } catch (err) {
      setError('Failed to delete user. Please try again with a different account.');
      setShowDeleteConfirm(false);
      
      // Show error notification
      showNotification('Failed to delete user. Please try again with a different account.', 'error');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Helper function to show notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ ...notification, show: false });
  };

  // Function to normalize and display role
  const getDisplayRole = (role) => {
    if (!role) return 'Reader'; // Default case
    
    const lowerCaseRole = role.toLowerCase();
    switch(lowerCaseRole) {
      case 'admin': return 'Admin';
      case 'author': return 'Author';
      default: return 'Reader';
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-app-container">
      {/* Notification */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

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
            <li className="active">
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
            <h1>Manage Users</h1>
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

        {/* Users Table */}
        <div className="admin-content-section">
          <div className="users-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <span 
                        className="user-name-link"
                        onClick={() => handleViewUser(user)}
                      >
                        {user.username}
                      </span>
                    </td>
                    <td>{getDisplayRole(user.role)}</td>
                    <td>
                      <button
                        onClick={() => handleViewUser(user)}
                        className="view-btn"
                      >
                        <i className="fas fa-eye"></i> View
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        className="delete-btn"
                      >
                        <i className="fas fa-trash-alt"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <div className="no-data">No users found.</div>
            )}
          </div>
        </div>

        {/* User Detail Modal */}
        {showModal && selectedUser && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="user-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>User Details</h2>
                <span className="close-btn" onClick={closeModal}>&times;</span>
              </div>
              <div className="modal-body">
                <div className="user-details">
                  <div className="user-detail-row">
                    <span className="detail-label">Full Name:</span>
                    <span className="detail-value">{selectedUser.name || 'Not specified'}</span>
                  </div>
                  <div className="user-detail-row">
                    <span className="detail-label">Username:</span>
                    <span className="detail-value">{selectedUser.username}</span>
                  </div>
                  <div className="user-detail-row">
                    <span className="detail-label">Role:</span>
                    <span className="detail-value">{getDisplayRole(selectedUser.role)}</span>
                  </div>
                  
                  {/* Show comment count for readers and authors */}
                  {(selectedUser.role && selectedUser.role.toLowerCase() !== 'admin') && (
                    <div className="user-detail-row">
                      <span className="detail-label">Total Comments:</span>
                      <span className="detail-value">{selectedUser.comments_count || 0}</span>
                    </div>
                  )}
                  
                  {/* Show books written only for authors */}
                  {selectedUser.role && selectedUser.role.toLowerCase() === 'author' && (
                    <div className="user-detail-row">
                      <span className="detail-label">Books Written:</span>
                      <span className="detail-value">{selectedUser.books_count || 0}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && userToDelete && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <div className="confirmation-header">
                <h3>Confirm Deletion</h3>
              </div>
              <div className="confirmation-body">
                <div className="warning-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <p>Are you sure you want to delete the user "{userToDelete.username}"?</p>
                <p className="warning-text">This action cannot be undone!</p>
              </div>
              <div className="confirmation-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-delete-btn"
                  onClick={confirmDelete}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;