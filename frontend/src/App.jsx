import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Unlock, Upload as UploadIcon, LogOut, Shield } from 'lucide-react';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Embed from './pages/Embed';
import Extract from './pages/Extract';

const Navigation = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="nav-bar glass-panel animate-fade-in">
      <div className="nav-brand flex-row">
        <Shield size={28} className="text-accent" color="#6366f1" />
        <h2 className="gradient-brand">StegoSafe</h2>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/upload" className={`nav-link ${isActive('/upload')}`}>Upload & Encode</Link>
            <Link to="/extract" className={`nav-link ${isActive('/extract')}`}>Decode</Link>
            <button onClick={handleLogout} className="btn btn-secondary" style={{padding: '8px 16px', width: 'auto'}}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-secondary" style={{padding: '8px 16px', width: 'auto'}}>Login</Link>
        )}
      </div>
    </nav>
  );
};

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <Router basename="/AI_Stego">
      <div className="app-container">
        <Navigation user={user} setUser={setUser} />
        <div className="page-container">
          <Routes>
            <Route path="/" element={user ? <Upload /> : <Login setUser={setUser} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/embed" element={<Embed />} />
            <Route path="/extract" element={<Extract />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
