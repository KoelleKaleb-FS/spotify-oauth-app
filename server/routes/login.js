const express = require('express');
require('dotenv').config();
const axios = require('axios');
const querystring = require('querystring');

const app = express();
const PORT = process.env.PORT || 3000;

const client_id = process.env.SPOTIFY_CLIENT_ID; 
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; 
const redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri

// Debugging lines to check if variables are loaded
console.log('Client ID:', client_id); 
console.log('Client Secret:', client_secret);

// Scope for the data you need access to
const scope = 'user-read-private user-read-email';

// Login route
app.get('/login', (req, res) => {
    const authUrl = 'https://accounts.spotify.com/authorize?' + 
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri
        });
    res.redirect(authUrl);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
