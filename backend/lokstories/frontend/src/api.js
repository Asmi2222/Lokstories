import axios from 'axios';

// Set up the base URL for your Django backend
const API_URL = 'http://localhost:8000';  // Change this if your backend is hosted elsewhere

// Function to handle login
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login/`, { username, password });
    console.log('Login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response ? error.response.data : error.message);
    throw error;
  }
};
