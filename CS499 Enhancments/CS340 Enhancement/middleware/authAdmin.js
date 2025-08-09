/**
 * Authorization middleware for admin-only routes.
 * Ensures the authenticated user has the 'admin' role before proceeding.
 */
module.exports = function (req, res, next) {
    // Check if user is authenticated and has the 'admin' role
    if (req.user && req.user.role === 'admin') {
        return next();  // Grant access to the next middleware or route
    } else {
        // User is not authorized (not an admin)
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
};