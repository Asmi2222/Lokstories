// Enhanced AuthChecker.js
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth'; // Update path as needed

const AuthChecker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const checkAuth = () => {
    // If user is authenticated and trying to access login page, redirect to appropriate dashboard
    if (isAuthenticated() && (location.pathname === '/' || location.pathname === '/login')) {
      const userRole = localStorage.getItem('user_role');
      
      if (userRole === 'admin') {
        navigate('/dashboard', { replace: true });
      } else if (userRole === 'Author') {
        navigate('/authors-homepage', { replace: true });
      } else if (userRole === 'Reader') {
        navigate('/readers-homepage', { replace: true });
      } else {
        // Fallback for any other authenticated users
        navigate('/profile', { replace: true });
      }
      return;
    }
    
    // Your existing auth check for protected routes
    if (location.pathname !== '/' && location.pathname !== '/register') {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/', { replace: true });
      }
    }
  };

  useEffect(() => {
    // Run check when component mounts and when location changes
    checkAuth();
    
    // This will handle back button navigation specifically
    const handlePopState = () => {
      checkAuth();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname]);

  return null;
};

export default AuthChecker;