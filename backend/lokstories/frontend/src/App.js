import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage'; 
import RegisterPage from './pages/RegisterPage'; 
import AuthorsHomepage from './pages/AuthorsHomePage'; 
import ReadersHomePage from './pages/ReadersHomePage';
import Dashboard from './pages/Dashboard';
import StoryPage from './pages/StoryPage'; 
import UploadStory from './pages/UploadStory';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/authors-homepage" element={<AuthorsHomepage />} />
          <Route path="/readers-homepage" element={<ReadersHomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stories/:id" element={<StoryPage />} />
          <Route path="/upload-story" element={<UploadStory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
