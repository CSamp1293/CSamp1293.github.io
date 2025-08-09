// Main application entry point for the Flight Booking System.
// Sets up Express server, connects to MongoDB, applies middleware, and routes HTTP traffic.

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");

dotenv.config();  // Load environment variables from .env

const app = express();

// Import route modules
const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");
const bookingRoutes = require("./routes/booking");
const flightRoutes = require("./routes/flight");
const uiRoutes = require("./routes/ui");

// Middleware: Decode user from JWT cookie, if present
const decodeUser = require("./middleware/decodeUser"); // add your decodeUser middleware here

// Logging: File-based and console loggers using Morgan
const { fileLogger, consoleLogger } = require("./utils/logger");

// ========== Middleware Setup ========== //

// Parse incoming JSON payloads
app.use(express.json());

// Parse cookies for JWT token handling
app.use(cookieParser());

// Parse URL-encoded form data (extended=true for rich objects)
app.use(express.urlencoded({ extended: true }));

// Use EJS layouts to manage consistent page structure
app.use(expressLayouts);

// Serve static files from 'public' directory
app.use(express.static("public"));

// Attach detailed and console logging for all HTTP requests
app.use(fileLogger);  // Log detailed requests to file
app.use(consoleLogger);  // Log concise requests to console


// ========== View Engine Setup ========== //

app.set("view engine", "ejs");  // Set EJS as the view engine
app.set("views", path.join(__dirname, "views"));  // Set views directory
app.set("layout", "layout");  // Default layout file

// Redundant but safe static directory assignment
app.use(express.static(path.join(__dirname, "public")));

// ========== Route Binding ========== //

// Apply decodeUser globally to allow user data injection into UI views
app.use(decodeUser);

// API Endpoints (JSON-based)
app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/flights", flightRoutes);

// UI Routes (EJS-rendered pages)
app.use("/", uiRoutes);

// ========== MongoDB Connection ========== //

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected.");
        app.listen(process.env.PORT, () => 
            console.log(`Server running on port ${process.env.PORT}`)
        );
    })
    .catch((err) => console.error("MongoDB connection error:", err));