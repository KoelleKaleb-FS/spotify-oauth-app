const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const qs = require('qs');
require('dotenv').config();

const router = express.Router();

// Middleware to validate JWT and check expiration
const validateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header
    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = decoded; // Store the decoded token data in req.user
        next();
    });
};

// Middleware to refresh token if expired
const refreshTokenIfExpired = async (req, res, next) => {
    const tokenExpiration = req.user.exp * 1000; // Convert expiration to milliseconds
    const now = Date.now();

    if (tokenExpiration < now) {
        const refresh_token = req.user.refreshToken; // Get refresh_token from the user data

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

            req.user.accessToken = newAccessToken; // Store new access token in req.user for further requests
            next();
        } catch (error) {
            console.error('Error refreshing token:', error);
            res.status(500).json({ error: 'Failed to refresh token' });
        }
    } else {
        next();
    }
};

// Route for explicitly refreshing tokens
router.get('/refresh_token', async (req, res) => {
    const refresh_token = req.query.refresh_token; // Get refresh_token from client-side or stored server-side

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

module.exports = { router, validateToken, refreshTokenIfExpired };
