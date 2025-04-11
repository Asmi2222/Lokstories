import axios from 'axios';
import { logout } from './auth';

// Set up the base URL for your Django backend
const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api/`
});

// Add auth token to every request
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Handle authentication errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      logout();
      window.location.href = '/'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

// Authentication functions
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login/`, { username, password });
    // Store token in localStorage upon successful login
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      // Store user role if available
      if (response.data.role) {
        localStorage.setItem('user_role', response.data.role);
      }
    }
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Export the api instance for other requests
export default api;