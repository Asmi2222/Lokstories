import React from 'react';
import { Navigate } from 'react-router-dom';

// Base Protected Route component
export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Admin Route - requires admin role
export const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('user_role');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  if (userRole !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Author Route - requires Author role
export const AuthorRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('user_role');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  if (userRole !== 'Author') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Reader Route - requires Reader role
export const ReaderRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('user_role');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  if (userRole !== 'Reader') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Combined Reader or Author Route
export const ReaderAuthorRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('user_role');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  if (userRole !== 'Reader' && userRole !== 'Author') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};