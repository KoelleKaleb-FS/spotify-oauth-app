const jwt = require('jsonwebtoken');

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

        // Create a JWT and sign it with a secret
        const userJwt = jwt.sign({
            access_token: accessToken,
            refresh_token: refreshToken
        }, process.env.JWT_SECRET, { expiresIn: '1h' }); // 1 hour expiry for example

        // Respond with the JWT
        res.json({
            token: userJwt
        });

    }).catch(error => {
        res.status(400).send('Error retrieving access token');
    });
});
