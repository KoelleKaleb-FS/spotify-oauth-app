const querystring = require('querystring');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Handle Spotify OAuth callback
app.get('/callback', (req, res) => {
    console.log('Callback request:', req.query);
    const code = req.query.code || null; // Get the authorization code

    if (!code) {
        console.error('Authorization code is missing');
        return res.status(400).send('No code provided');
    }

    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const tokenData = querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri, // Ensure this matches the one in your Spotify app
        client_id: clientId,
        client_secret: clientSecret
    });

    axios.post(tokenUrl, tokenData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => {
        const accessToken = response.data.access_token; // Check if this is undefined or null
        const refreshToken = response.data.refresh_token; // Check if this is undefined or null

        if (!accessToken || !refreshToken) {
            console.error('Access token or refresh token is missing:', response.data);
            return res.status(500).send('Failed to retrieve tokens');
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            { accessToken, refreshToken },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send back tokens
        res.json({
            access_token: accessToken,
            refresh_token: refreshToken,
            jwt_token: jwtToken
        });
    })
    .catch(error => {
        console.error('Error retrieving access token:', error.response ? error.response.data : error);
        res.status(500).send('Error retrieving access token');
    });
});
