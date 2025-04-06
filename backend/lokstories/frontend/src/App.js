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

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/authors-homepage" element={<AuthorsHomepage />} />
          <Route path="/readers-homepage" element={<ReadersHomePage />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/stories/:id" element={<StoryPage />} />
          <Route path="/upload-story" element={<UploadStory />} />
          <Route path="/edit-story/:id" element={<EditStory />} />
          <Route path="/admin/stories" element={<AdminStories />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/profile" element={<UserProfile />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
