// Defines RESTful routes for flight data management.
// Includes both public endpoints for browsing flights
// and proctected endpoints for flight creation, modification, and deletion (admin only).

const express = require("express");
const {
    createFlight,
    getAllFlights,
    getFlightById,
    updateFlight,
    deleteFlight,
    getFlightsPaginatedPublic,
} = require("../controllers/flightController");

const authenticate = require("../middleware/auth");
const authorizeAdmin = require("../middleware/authAdmin");

const router = express.Router();

/**
 * GET /flight/paginated
 * Public route for retrieving flights with pagination and filtering.
 * Designed for the "Browse Flights" UI used by guests and logged-in users.
 * Access: Public
 */
router.get("/paginated", getFlightsPaginatedPublic);

/**
 * GET /flight/
 * Returns all flights in the system.
 * Intended for general viewing, possibly in admin dashboards or user views.
 * Access: Public
 */
router.get("/", getAllFlights);

/**
 * GET /flight/:id
 * Fetch a specific flight by its MongoDB ObjectId.
 * Access: Public
 */
router.get("/:id", getFlightById);

/**
 * POST /flight/
 * Create a new flight entry in the database.
 * Requires authentication and admin privlieges.
 * Access: Admin only
 */
router.post("/", authenticate, authorizeAdmin, createFlight);

/**
 * PUT /flight/:id
 * Update and existing flight by ID.
 * Requires authentication and admin privleges.
 * Access: Admin only
 */
router.put("/:id", authenticate, authorizeAdmin, updateFlight);

/**
 * DELETE /flight/:id
 * Delete an existing flight by ID.
 * Requires authentication and admin privleges.
 * Access: Admin only
 */
router.delete("/:id", authenticate, authorizeAdmin, deleteFlight);

module.exports = router;