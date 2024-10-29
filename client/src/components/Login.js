import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Function to handle email/password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5050/api/auth/login', { email, password });
      localStorage.setItem('jwt_token', response.data.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your email and password.');
    }
  };

  // Function to handle Spotify login (optional)
  const handleSpotifyLogin = () => {
    const clientId = '3e955f6f8ab54fb3bcdfa42631be1ffd'; // Replace with your actual Client ID
    const redirectUri = 'http://localhost:3000/callback'; // Ensure this matches your Spotify app
    const scopes = 'user-read-recently-played'; // Adjust scopes as necessary

    // Redirect to Spotify authorization URL
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code`;
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Login to Your Account</h1>
      <form className="login-form" onSubmit={handleEmailLogin}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
      <p className="login-footer">
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
      <button className="spotify-button" onClick={handleSpotifyLogin}>
  Login with Spotify
</button>
    </div>
  );
};

export default Login;
