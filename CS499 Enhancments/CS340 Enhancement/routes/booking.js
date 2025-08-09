// Defines routes for flight booking and cancellation.
// Booking is restricted to authenticated users.
// Cancellation is restricted to authenticated admin users.

const express = require('express');
const router = express.Router();

// Controller functions for booking operations
const { bookFlight, cancelBooking } = require('../controllers/bookingController');

// Middleware to verify authentication (JWT required)
const authenticate = require('../middleware/auth');

// Middleware to verify admin role
const authorizeAdmin = require('../middleware/authAdmin');

/**
 * POST /booking/
 * Allows an authenticated user to book a flight.
 * Request body must contain valid flight and customer details.
 * Access: Authenticated users only (any role).
 */
router.post('/', authenticate, bookFlight);

/**
 * DELETE /booking/:id
 * Allows an admin to cancel a specific booking by its ID.
 * Booking ID is passed as a route parameter.
 * Access: Admin only (authenticated and authorized)
 */
router.delete('/:id', authenticate, authorizeAdmin, cancelBooking);

module.exports = router;