import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

const SessionTimeoutHandler = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  
  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      // Session expired
      logout();
      navigate('/', { replace: true });
    }, SESSION_TIMEOUT);
  };
  
  useEffect(() => {
    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Only set up listeners if user is logged in
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // Initial timeout
    resetTimeout();
    
    // Set up event listeners to reset timeout on user activity
    const activityHandler = () => resetTimeout();
    events.forEach(event => {
      window.addEventListener(event, activityHandler);
    });
    
    // Clean up
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, activityHandler);
      });
    };
  }, [navigate]);
  
  return null;
};

export default SessionTimeoutHandler;