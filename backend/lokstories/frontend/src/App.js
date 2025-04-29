import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import LoginPage from './pages/LoginPage'; 
import RegisterPage from './pages/RegisterPage'; 
import AuthorsHomepage from './pages/AuthorsHomePage'; 
import ReadersHomePage from './pages/ReadersHomePage';
import AdminDashboard from './pages/AdminDashboard';
import StoryPage from './pages/StoryPage'; 
import UploadStory from './pages/UploadStory';
import EditStory from './pages/EditStory';
import AdminStories from './pages/AdminStories';
import AdminUsers from './pages/AdminUsers';
import UserProfile from './pages/UserProfile';
import AdminComments from './pages/AdminComments';
import Unauthorized from './pages/Unauthorized';
import { ProtectedRoute, AdminRoute, AuthorRoute, ReaderRoute,ReaderAuthorRoute } from './pages/ProtectedRoute';
import AuthChecker from './pages/AuthChecker';
import SessionTimeoutHandler from './pages/SessionTimeoutHandler'; 
import TokenRefresher from './pages/TokenRefresher';
function App() {
  return (
    <Router>
      <AuthChecker />
      <SessionTimeoutHandler /> 
      <TokenRefresher />
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/authors-homepage" element={<AuthorRoute><AuthorsHomepage /></AuthorRoute>} />
          <Route path="/readers-homepage" element={<ReaderRoute><ReadersHomePage /></ReaderRoute>} />
          <Route path="/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/stories/:id" element={<ReaderAuthorRoute><StoryPage /></ReaderAuthorRoute>} />
          <Route path="/upload-story" element={<AuthorRoute><UploadStory /></AuthorRoute>} />
          <Route path="/edit-story/:id" element={<AuthorRoute><EditStory /></AuthorRoute>} />
          <Route path="/admin/stories" element={<AdminRoute><AdminStories /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/admin/comments" element={<AdminRoute><AdminComments /></AdminRoute>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
