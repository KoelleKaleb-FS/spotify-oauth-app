const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');
const verifyJWT = require('./middlewares/verifyJWT');
const spotifyRoutes = require('./routes/spotifyRoutes'); // Import custom Spotify routes

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Needed to parse JSON requests

// Spotify credentials from .env
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI || 'http://localhost:3000/callback';

const scope = 'user-read-private user-read-email';

// Login route
app.get('/login', (req, res) => {
    const authUrl = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri
        });
    res.redirect(authUrl);
});

// Handle Spotify OAuth callback
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

        // Generate JWT
        const jwtToken = jwt.sign(
            { accessToken, refreshToken },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            access_token: accessToken,
            refresh_token: refreshToken,
            jwt_token: jwtToken
        });
    }).catch(error => {
        res.send('Error retrieving access token');
    });
});

// Refresh token route
app.get('/refresh_token', (req, res) => {
    const refreshToken = req.query.refresh_token;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Missing refresh_token' });
    }

    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const tokenData = querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
    });

    axios.post(tokenUrl, tokenData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(response => {
        const newAccessToken = response.data.access_token;

        res.json({
            access_token: newAccessToken
        });
    }).catch(error => {
        console.error('Error refreshing token:', error);
        res.status(500).json({ error: 'Failed to refresh token' });
    });
});

// Use Spotify routes
app.use('/api/spotify', spotifyRoutes); // Use custom Spotify API routes

// Basic route
app.get('/', (req, res) => {
    res.send('Spotify OAuth API is running');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
