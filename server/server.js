const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');
const cors = require('cors');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');
const verifyJWT = require('./middlewares/verifyJWT'); // Middleware for JWT verification
const auth = require('./routes/auth'); // Your auth routes
const spotifyRoutes = require('./routes/spotifyRoutes'); // Your Spotify API routes

const app = express();
const PORT = process.env.PORT || 5050;

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Needed to parse JSON requests

// Spotify credentials from .env
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI || 'http://localhost:3000/callback';
const scope = 'user-read-recently-played';

// Login route to initiate Spotify OAuth flow
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
app.get('/callback', async (req, res) => {
    // Log the incoming request query parameters
    console.log('Callback request:', req.query);
    
    const code = req.query.code || null;

    // Check for the presence of the authorization code
    if (!code) {
        console.error('Authorization code is missing');
        return res.status(400).send('Missing authorization code');
    }

    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const tokenData = querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
    });

    try {
        // Make a request to exchange the authorization code for an access token
        const response = await axios.post(tokenUrl, tokenData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;

        // Generate JWT
        const jwtToken = jwt.sign(
            { accessToken, refreshToken },
            process.env.JWT_SECRET, // Ensure your secret is correctly set
            { expiresIn: '1h' }
        );

        // Send tokens in the response
        res.json({
            access_token: accessToken,
            refresh_token: refreshToken,
            jwt_token: jwtToken // Return the generated JWT token
        });
    } catch (error) {
        console.error('Error retrieving access token:', error.response ? error.response.data : error.message);
        res.status(500).send('Error retrieving access token');
    }
});

// Refresh token route
app.get('/refresh_token', async (req, res) => {
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

    try {
        const response = await axios.post(tokenUrl, tokenData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const newAccessToken = response.data.access_token;

        res.json({
            access_token: newAccessToken
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});

// Use Spotify routes
app.use('/api/spotify', verifyJWT, spotifyRoutes); // Apply JWT verification middleware

// Basic route
app.get('/', (req, res) => {
    res.send('Spotify OAuth API is running');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
