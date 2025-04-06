import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/users/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load users. Please make sure you have admin privileges.');
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/admin/users/delete/${userId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        setError('Failed to delete user. Please try again.');
      }
    }
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

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-container">
      <h1 className="admin-title">Manage Users</h1>
      
      <Link to="/dashboard" className="back-link">
        ← Back to Dashboard
      </Link>

      <div className="users-container">
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
                <td>{user.username}</td>
                <td>{getDisplayRole(user.role)}</td>
                <td>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
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
      
      {users.length === 0 && (
        <div className="no-data">No users found.</div>
      )}
    </div>
  );
};

export default AdminUsers;