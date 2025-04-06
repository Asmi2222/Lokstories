import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Admin.css';


const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_stories: 0,
    user_roles: [],
    story_genres: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:8000/api/admin/dashboard/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data. Please make sure you have admin privileges.');
        setLoading(false);
      }
    };
  
    fetchDashboardStats();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h2>Total Users</h2>
          <div className="stat-number">{stats.total_users}</div>
        </div>
        
        <div className="stat-card">
          <h2>Total Stories</h2>
          <div className="stat-number">{stats.total_stories}</div>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="users-by-role">
          <h3>Users by Role</h3>
          <ul>
            {stats.user_roles.map((role, index) => (
              <li key={index}>
                {role.role}: <strong>{role.count}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="stories-by-genre">
          <h3>Stories by Genre</h3>
          <ul>
            {stats.story_genres.map((genre, index) => (
              <li key={index}>
                {genre.genre || 'Uncategorized'}: <strong>{genre.count}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/admin/stories" className="dashboard-action-btn">
          Manage Stories
        </Link>
        <Link to="/admin/users" className="dashboard-action-btn">
          Manage Users
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;