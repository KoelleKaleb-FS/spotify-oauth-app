import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './DashBoard.css';

const Dashboard = () => {
    const [playlists, setPlaylists] = useState([]);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                throw new Error('No token found in localStorage');
            }

            const response = await axios.get('http://localhost:5050/api/spotify/playlists', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            // Log the full response
            console.log('API Response:', response.data);
            
            // Assuming the playlists are in response.data.items
            setPlaylists(response.data.items || []); // Change to items based on your API response
        } catch (error) {
            console.error('Error fetching data:', error.response ? error.response.data : error.message);
            if (error.response && error.response.status === 401) {
                setError('Unauthorized: Please log in again.');
            } else {
                setError('Failed to fetch playlists.');
            }
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
      <div className="dashboard-container">
          <h1>Your Playlists</h1>
          {error && <p className="error-message">{error}</p>}
          {playlists.length > 0 ? (
              <ul className="playlist-list">
                  {playlists.map((playlist) => (
                      <li className="playlist-item" key={playlist.id}>
                          <a
                              className="playlist-link"
                              href={playlist.external_urls.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                          >
                              {playlist.name}
                          </a>
                      </li>
                  ))}
              </ul>
          ) : (
              <p>No playlists available.</p>
          )}
      </div>
  );
};

export default Dashboard;
