const express = require('express');
require('dotenv').config();
const axios = require('axios');
const querystring = require('querystring');

const app = express();
const PORT = process.env.PORT || 3000;

// Spotify credentials from .env
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

// Step 1: Redirect to Spotify's OAuth page
app.get('/login', (req, res) => {
    const scope = 'user-read-private user-read-email'; // Add scopes as needed
    const authUrl = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri
        });
    res.redirect(authUrl);
});

// Step 2: Handle Spotify OAuth callback
app.get('/callback', (req, res) => {
    const code = req.query.code || null;

    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const tokenData = querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
    });

    axios.post(tokenUrl, tokenData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(response => {
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;

        // Redirect to a protected page or store token for further API calls
        res.json({
            access_token: accessToken,
            refresh_token: refreshToken
        });
    }).catch(error => {
        res.send('Error retrieving access token');
    });
});

// Basic route
app.get('/', (req, res) => {
    res.send('Spotify OAuth API is running');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
