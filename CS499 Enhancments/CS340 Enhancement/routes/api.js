// Defines API routes for administrative operations on bookings and flights.
// These routes are protected by authentication and admin authorization middleware,
// ensuring only logged-in admins can access paginated data with optional filtering/search
const express = require('express');
const router = express.Router();

// Middleware to verify user authentication
const authenticate = require('../middleware/auth');

// Middleware to verify admin-level authorization
const authorizeAdmin = require('../middleware/authAdmin');

// Controller function to retrieve bookings with pagination and optional search/filter criteria
const {
  getBookingsPaginated,
} = require('../controllers/bookingController');

// Controller function to retrieve flights with pagination and optional search/filter criteria
const {
  getFlightsPaginated,
} = require('../controllers/flightController');

// Route: GET /api/admin/bookings
// Description: Returns paginated bookings data with search and filter support.
// Access: Admin only (authenticated and authorized)
router.get('/admin/bookings', authenticate, authorizeAdmin, getBookingsPaginated);

// Route: GET /api/admin/flights
// Description: Returns paginated flights data with search and filter support.
// Access: Admin only (authenticated and authorized)
router.get('/admin/flights', authenticate, authorizeAdmin, getFlightsPaginated);

module.exports = router;