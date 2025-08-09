// Import required modules
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User =  require('../models/User');

// Load environment variables from .env file
dotenv.config();

/**
 * Authentication middleware for protected routes.
 * Verifies JWT token from cookie or Authorization header,
 * attatches authenticated user to request object if valid.
 */
module.exports = async function (req, res, next) {
    // Extract token from cookies or Authorization header (Bearer scheme)
    const token =
        req.cookies.token ||
        (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    // If no token is provided, deny access
    if (!token) {
        return res.status(401).json({ message: "No token provided." });
    }

    try {
        // Verify token using secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user associated with the token payload
        const user = await User.findById(decoded.id);

        // If user does not exist, deny access
        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }

        // Attach user object to request for use in subsequent middleware/routes
        req.user = user;

        // Continue to the next middleware or route handler
        next();
    } catch (err) {
        // Token is invalid or expired
        return res.status(403).json({ message: 'Invalid token.' });
    }
};