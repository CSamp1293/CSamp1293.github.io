// Defines all UI-facing (EJS-rendered) route handlers for both public and authenticated users.
// Pages rendered here are influenced by login status using optional or strict authentication.
// Includes user and admin dashboard pages, registration/login views, and public-facing flight browsing.

const express = require("express");
const router = express.Router();

const decodeUser = require("../middleware/decodeUser");
const authenticate = require("../middleware/auth");
const authorizeAdmin = require("../middleware/authAdmin");

const Flight = require("../models/Flight");
const Booking = require("../models/Booking");

// ========== Public Routes ========== //

/**
 * GET /
 * Home page which doubles as the "Browse Flights" UI.
 * Renders differently if user is logged in (e.g., shows booked flights).
 * Access: Public
 */
router.get("/", decodeUser, async (req, res) => {
  let bookedFlightIds = [];

  // If user is logged in, retrieve their booked flight IDs
  if (req.user && req.user.role === "user") {
    const bookings = await Booking.find({ user: req.user._id });
    bookedFlightIds = bookings.map((b) => b.flight.toString());
  }

  res.render("browse-flights", {
    title: "Browse Flights",
    user: req.user || null,
    bookedFlightIds,
  });
});

/**
 * GET /login
 * Renders login page.
 * Access: Public
 */
router.get("/login", decodeUser, (req, res) => {
  res.render("login", {
    title: "Login",
    user: req.user || null,
    errors: [],
    successMessage: null,
    formData: {},
  });
});

/**
 * GET /register/user
 * Renders user registration form.
 * Access: Public
 */
router.get("/register/user", decodeUser, (req, res) => {
  res.render("register_user", {
    title: "User Registration",
    user: req.user || null,
    errors: [],
    successMessage: null,
    formData: {},
  });
});

/**
 * GET /register/admin
 * Renders admin registration form.
 * Access: Admin only
 */
router.get("/register/admin", authenticate, authorizeAdmin, (req, res) => {
  res.render("register_admin", {
    title: "Admin Registration",
    user: req.user || null,
    errors: [],
    successMessage: null,
    formData: {},
  });
});

/**
 * GET /flights
 * Alias for homepage. Renders Browse Flights UI.
 * Access: Public
 */
router.get("/flights", decodeUser, async (req, res) => {
  let bookedFlightIds = [];

  if (req.user && req.user.role === "user") {
    const bookings = await Booking.find({ user: req.user._id });
    bookedFlightIds = bookings.map((b) => b.flight.toString());
  }

  res.render("browse-flights", {
    title: "Browse Flights",
    user: req.user || null,
    bookedFlightIds,
  });
});

// ========== User Routes ========== //

/**
 * GET /dashboard/user
 * Renders the user's dashboard with recommended flights.
 * Recommendation criteria varies by sort method:
 * - "popular": most-booked flights (fallback to cheapest)
 * - "cheapest": lowest price
 * - "mostSeats": highest availability
 * Access: Authenticated user
 */
router.get("/dashboard/user", authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).select("flight");
    const bookedFlightIds = bookings.map(b => b.flight.toString());
    const sortMethod = req.query.sort || "popular";

    let recommendedFlights = [];

    if (sortMethod === "popular") {
      // Aggregate most-booked flights
      const topFlightIds = await Booking.aggregate([
        { $group: { _id: "$flight", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      const topIds = topFlightIds.map(b => b._id).filter(id => !bookedFlightIds.includes(id.toString()));
      recommendedFlights = await Flight.find({ _id: { $in: topIds } }).lean();

      // Supplement with cheapest flights if fewer than 5
      if (recommendedFlights.length < 5) {
        const extraFlights = await Flight.find({
          _id: { $nin: [...topIds, ...bookedFlightIds] }
        })
          .sort({ price: 1 })
          .limit(5 - recommendedFlights.length)
          .lean();

        recommendedFlights = [...recommendedFlights, ...extraFlights];
      }

    } else if (sortMethod === "cheapest") {
      recommendedFlights = await Flight.find({ _id: { $nin: bookedFlightIds } })
        .sort({ price: 1 })
        .limit(5)
        .lean();

    } else if (sortMethod === "mostSeats") {
      recommendedFlights = await Flight.find({ _id: { $nin: bookedFlightIds } })
        .sort({ availableSeats: -1 })
        .limit(5)
        .lean();
    }

    res.render("dashboard-user", {
      title: "User Dashboard",
      user: req.user,
      flights: recommendedFlights,
      bookedFlightIds,
      sort: sortMethod,
    });

  } catch (err) {
    console.error("Error loading user dashboard:", err);
    res.status(500).send("Server error.");
  }
});

/**
 * GET /user/bookings
 * Displays a user's current bookings.
 * Populates each booking with flight details.
 * Filters out stale/incomplete bookings.
 * Access: Authenticated users with 'user' role
 */
router.get("/user/bookings", authenticate, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).send("Access denied.");
  }

  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("flight");

    // Remove bookings with missing flight data
    const validBookings = bookings.filter(b => b.flight !== null);

    res.render("user-bookings", {
      title: "My Bookings",
      user: req.user,
      bookings: validBookings,
    });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).send("Server error.");
  }
});

// ========== Admin Routes ========== //

/**
 * GET /dashboard/admin
 * Main entry point to admin UI.
 * No data fetched here—view is a dashboard menu hub.
 * Access: Admin only
 */
router.get("/dashboard/admin", authenticate, authorizeAdmin, (req, res) => {
  res.render("dashboard-admin", {
    title: "Admin Dashboard",
    user: req.user,
  });
});

/**
 * GET /admin/flights
 * UI view for managing flights.
 * Likely used with AJAX to load paginated data.
 * Access: Admin only
 */
router.get("/admin/flights", authenticate, authorizeAdmin, (req, res) => {
  res.render("admin-flights", {
    title: "Manage Flights",
    user: req.user,
  });
});

/**
 * GET /admin/bookings
 * UI view for reviewing or managing all bookings.
 * Access: Admin only
 */
router.get("/admin/bookings", authenticate, authorizeAdmin, (req, res) => {
  res.render("admin-bookings", {
    title: "View Bookings",
    user: req.user,
  });
});

module.exports = router;