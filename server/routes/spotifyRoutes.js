// routes/spotifyRoutes.js
const express = require('express');
const axios = require('axios');
const verifyJWT = require('../middlewares/verifyJWT');
const { validateToken, refreshTokenIfExpired } = require('../auth');

const router = express.Router();

// Fetch user profile data
router.get('/profile', verifyJWT, async (req, res) => {
    const { accessToken } = req.user; // accessToken is extracted from JWT
    
    try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        res.json(response.data); // Send back user profile data
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Fetch user's playlists
router.get('/playlists', verifyJWT, async (req, res) => {
    const { accessToken } = req.user;

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        res.json(response.data); // Send back playlists data
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
});

module.exports = router;
