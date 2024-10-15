const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    // Extract the token from the "Bearer <token>" format
    const actualToken = token.split(' ')[1];

    jwt.verify(actualToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token' });
        }
        // Save the decoded information (usually user info) to the request object for future use
        req.user = decoded;
        next(); // Continue to the next middleware or route handler
    });
};

module.exports = verifyJWT;
