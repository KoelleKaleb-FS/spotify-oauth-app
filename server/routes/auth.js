const express = require('express');
const axios = require('axios');
const qs = require('qs');
require('dotenv').config();

const router = express.Router();

// Refresh token route
router.get('/refresh_token', async (req, res) => {
    const refresh_token = req.query.refresh_token; // get refresh_token from client-side or stored server-side

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', qs.stringify({
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
        }), {
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

module.exports = router;
