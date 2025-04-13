import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_users: 0,
    total_stories: 0,
    authors: 0,
    readers: 0,
    user_roles: [],
    story_genres: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState({
    profile_picture: null,
    name: ''
  });

  const fetchDashboardStats = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/admin/dashboard/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Process the data
      const roleData = response.data.user_roles;
      const authorCount = roleData.find(r => r.role === 'Author')?.count || 0;
      const readerCount = roleData.find(r => r.role === 'Reader')?.count || 0;
      
      setStats({
        ...response.data,
        authors: authorCount,
        readers: readerCount
      });
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      setError('Failed to load dashboard data. Please make sure you have admin privileges.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const response = await axios.get('http://localhost:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchProfile();
  }, []);

  const handleRefresh = () => {
    fetchDashboardStats();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Chart data preparation
  const userRoleChartData = stats.user_roles.map(role => ({
    name: role.role,
    value: role.count
  }));

  const genreChartData = stats.story_genres.map(genre => ({
    name: genre.genre || 'Uncategorized',
    value: genre.count
  }));

  // Colors for the charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) return <div className="loading">Loading dashboard...</div>;
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
            <li className="active">
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
        {/* Header with title, refresh, logout and profile */}
        <header className="admin-header">
          <div className="header-title">
            <h1>Admin Dashboard</h1>
          </div>
          <div className="header-actions">
            <button onClick={handleRefresh} className="refresh-button" disabled={refreshing}>
              <i className="fas fa-sync-alt"></i> {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={handleLogout} className="logout-button">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
            <Link to="/profile" className="admin-profile-link">
              {profile.profile_picture ? (
                <img 
                  src={`http://localhost:8000${profile.profile_picture}`} 
                  alt="Profile" 
                  className="admin-user-avatar" 
                />
              ) : (
                <div className="admin-user-avatar-placeholder">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon users-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-details">
              <h3>Total Users</h3>
              <div className="stat-number">{stats.total_users}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon author-icon">
              <i className="fas fa-pen-fancy"></i>
            </div>
            <div className="stat-details">
              <h3>Authors</h3>
              <div className="stat-number">{stats.authors}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon reader-icon">
              <i className="fas fa-book-reader"></i>
            </div>
            <div className="stat-details">
              <h3>Readers</h3>
              <div className="stat-number">{stats.readers}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon story-icon">
              <i className="fas fa-book"></i>
            </div>
            <div className="stat-details">
              <h3>Total Stories</h3>
              <div className="stat-number">{stats.total_stories}</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="dashboard-charts">
          {/* User Roles Bar Chart */}
          <div className="chart-container user-roles-chart">
            <h3>Users by Role</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={userRoleChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Users" fill="#ff7700" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stories by Genre Pie Chart */}
          <div className="chart-container genre-chart">
            <h3>Stories by Genre</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genreChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {genreChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Genre List Section */}
        <div className="genre-list-section">
          <h3>List of Genres</h3>
          <div className="genre-list">
            <table className="genre-table">
              <thead>
                <tr>
                  <th>Genre</th>
                  <th>Story Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {stats.story_genres.map((genre, index) => {
                  const percentage = ((genre.count / stats.total_stories) * 100).toFixed(1);
                  return (
                    <tr key={index}>
                      <td>{genre.genre || 'Uncategorized'}</td>
                      <td>{genre.count}</td>
                      <td>{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;