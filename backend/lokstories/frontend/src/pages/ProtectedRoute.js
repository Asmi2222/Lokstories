import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/auth';

// Component for routes that require any authentication
export const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" />;
  }
  return children;
};

// Component for admin-only routes
export const AdminRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" />;
  }
  
  const role = getUserRole();
  if (role !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

// Component for author-only routes
export const AuthorRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" />;
  }
  
  const role = getUserRole();
  if (role !== 'Author') {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

// Component for reader-only routes
export const ReaderRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" />;
  }
  
  const role = getUserRole();
  if (role !== 'Reader') {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

export const ReaderAuthorRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/" />;
    }
    
    const role = getUserRole();
    if (role !== 'Reader' && role !== 'Author') {
      return <Navigate to="/unauthorized" />;
    }
    
    return children;
  };