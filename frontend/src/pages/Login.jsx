import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Login = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await axios.post(`${API_URL}${endpoint}`, {
        username,
        password
      });

      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/upload');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form glass-panel animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="mb-4">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-mute">
          {isLogin 
            ? 'Sign in to encode or decode your hidden messages.' 
            : 'Join StegoSafe to secure your sensitive data using AI.'}
        </p>
      </div>

      {error && (
        <div className="alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Username</label>
          <input
            type="text"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
          />
        </div>
        
        <div className="input-group">
          <label className="input-label">Password</label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" className="btn mt-4" disabled={loading}>
          {loading ? 'Processing...' : (isLogin ? <><LogIn size={18} /> Sign In</> : <><UserPlus size={18} /> Register</>)}
        </button>
      </form>

      <div className="text-center mt-8">
        <p className="text-sm text-mute">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            className="btn-secondary" 
            style={{border:'none', padding:0, color:'var(--accent-primary)', background:'transparent'}}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
