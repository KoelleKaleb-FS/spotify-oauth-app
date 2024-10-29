import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async () => {
      const code = new URLSearchParams(window.location.search).get('code'); // Get the code from the URL

      if (code) {
        try {
          const response = await fetch(`http://localhost:5050/callback?code=${code}`, {
            method: 'GET',
            credentials: 'include', // Include credentials if needed
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          const jwtToken = data.jwt_token; // Get the JWT token from the response

          if (jwtToken) {
            localStorage.setItem('jwt_token', jwtToken); // Store it in localStorage
            navigate('/dashboard'); // Redirect to the dashboard
          } else {
            console.error('JWT token not found in response:', data);
          }
        } catch (error) {
          console.error('Error fetching token:', error);
        }
      } else {
        console.error('Authorization code is missing');
      }
    };

    fetchToken(); // Call the fetch function only once
  }, [navigate]);

  return <div>Loading...</div>; // Show a loading state while processing
};

export default Callback;
