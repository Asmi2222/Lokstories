import React, { useEffect, useRef } from 'react';
import axios from 'axios';

const TokenRefresher = () => {
  const refreshTimerRef = useRef(null);

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return;
      
      const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
        refresh: refreshToken
      });
      
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        
        // Update expiry if provided
        if (response.data.expires_in) {
          const expiryTime = Date.now() + (response.data.expires_in * 1000);
          localStorage.setItem('tokenExpiry', expiryTime.toString());
        }
        
        // Schedule next refresh
        scheduleRefresh();
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // If refresh fails, force logout
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user_role');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
  };

  const scheduleRefresh = () => {
    // Clear any existing timers
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    if (!tokenExpiry) return;
    
    const expiryTime = parseInt(tokenExpiry);
    const currentTime = Date.now();
    
    // Refresh 5 minutes before expiry
    const timeToRefresh = Math.max(0, expiryTime - currentTime - (5 * 60 * 1000));
    
    refreshTimerRef.current = setTimeout(refreshToken, timeToRefresh);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // Schedule initial refresh
    scheduleRefresh();
    
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  return null;
};

export default TokenRefresher;