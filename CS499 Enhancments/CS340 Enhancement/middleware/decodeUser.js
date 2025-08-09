// Middleware to decode a user from a JWT if one is provided (optional auth).
// Unlike strict authentication, this allows pages to render differently for logged-in vs. guest users.

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

module.exports = async function (req, res, next) {
    // Attempt to retrieve JWT from cookies or Authorization header
    const token =
        req.cookies.token ||
        (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    // If no token is present, treat as unauthenticated (user is null)
    if (!token) {
        req.user = null;
        return next();
    }

    try {
        // Decode token using JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attempt to retrieve user from database
        const user = await User.findById(decoded.id);

        // If user exists, attatch to request; otherwise, set to null
        if (!user) {
            req.user = null;
        } else {
            req.user = user;
        }
        return next();
    } catch (err) {
        // On token error (expired, invalid, etc.), treat as guest
        req.user = null;
        return next();
    }
};