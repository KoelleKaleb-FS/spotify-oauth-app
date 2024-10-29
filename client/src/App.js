import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom'; // Remove Router import
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Callback from './components/Callback';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="heading">Welcome to My Music App!</h1>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path='/callback' element={<Callback />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
};

export default App;
