const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

/**
 * Middleware to authenticate admin users based on JWT token.
 * Extracts the token from cookies or Authorization header,
 * verifies it, and ensures the user role is 'admin'.
 * Returns 401 if no token or invalid token, 403 if not admin.
 */
function authenticateAdmin(req, res, next) {
    const token =
        (req.cookies && req.cookies.token) ||
        (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ") &&
            req.headers.authorization.split(" ")[1]);

    if (!token) {
        return res.status(401).json({ message: "No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Admins only." });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token." });
    }
}

/**
 * POST /register/user
 * Public route to register a new user with validation.
 * Validates input, checks for existing email, 
 * hashes password, saves user with role 'user',
 * and renders appropriate response views.
 */
router.post(
    "/register/user",
    [
        check("name")
            .trim()
            .isLength({ min: 2 })
            .withMessage("Name must be at least 2 characters long."),
        check("email")
            .isEmail()
            .withMessage("Please enter a valid email address.")
            .normalizeEmail(),
        check("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long."),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Input validation failed - re-render registration with errors
            return res.status(400).render("register_user", {
                title: "User Registration",
                errors: errors.array(),
                user: req.user || null,
                formData: req.body,
                successMessage: null,
            });
        }

        const { name, email, password } = req.body;
        try {
            // Check for existing user with same email
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).render("register_user", {
                    title: "User Registration",
                    errors: [{ msg: "User with this email already exists." }],
                    user: req.user || null,
                    formData: req.body,
                    successMessage: null,
                });
            }

            // Hash password securely before saving
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ name, email, password: hashedPassword, role: "user" });
            await newUser.save();

            // registration successful - prompt user to log in
            res.status(201).render("login", {
                title: "Login",
                successMessage: "User registration successful! Please log in.",
                errors: [],
                user: req.user || null,
                formData: {},
            });
        } catch (err) {
            console.error("User registration error:", err);
            res.status(500).render("register_user", {
                title: "User Registration",
                errors: [{ msg: "Server error. Please try again later." }],
                user: req.user || null,
                formData: req.body,
                successMessage: null,
            });
        }
    }
);

/**
 * POST /register/admin
 * Admin-protected route to register a new admin user.
 * Uses authenticateAdmin middleware to restrict access.
 * Validates input, checks for existing email,
 * hashes password, saves user with role 'admin',
 * and renders appropriate response views
 */
router.post(
    "/register/admin",
    authenticateAdmin,
    [
        check("name")
            .trim()
            .isLength({ min: 2 })
            .withMessage("Name must be at least 2 characters long."),
        check("email")
            .isEmail()
            .withMessage("Please enter a valid email address.")
            .normalizeEmail(),
        check("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long."),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Input validation failed - re-render admin registration with errors
            return res.status(400).render("register_admin", {
                title: "Admin Registration",
                errors: errors.array(),
                user: req.user || null,
                formData: req.body,
                successMessage: null,
            });
        }

        const { name, email, password } = req.body;
        try {
            // Check for existing user with same email
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).render("register_admin", {
                    title: "Admin Registration",
                    errors: [{ msg: "User with this email already exists." }],
                    user: req.user || null,
                    formData: req.body,
                    successMessage: null,
                });
            }

            // Hash password securely before saving
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ name, email, password: hashedPassword, role: "admin" });
            await newUser.save();

            // Registration successful - render admin dashboard
            res.status(201).render("dashboard-admin", {
                title: "Admin Dashboard",
                successMessage: "Admin registration successful!",
                errors: [],
                user: req.user || null,
                formData: {},
            });
        } catch (err) {
            console.error("Admin registration error:", err);
            res.status(500).render("register_admin", {
                title: "Admin Registration",
                errors: [{ msg: "Server error. Please try again later." }],
                user: req.user || null,
                formData: req.body,
                successMessage: null,
            });
        }
    }
);

/**
 * POST /login
 * Public route to authenticate users.
 * Validates input, checks credentials,
 * issues JWT token in HTTP-only cookie,
 * redirects user to role-based dashboard on success,
 * and handles errors gracefully.
 */
router.post(
    "/login",
    [
        check("email")
            .isEmail()
            .withMessage("Please enter a valid email address.")
            .normalizeEmail(),
        check("password")
            .notEmpty()
            .withMessage("Password cannot be empty."),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Input validation failed - re-render login with errors
            return res.status(400).render("login", {
                title: "Login",
                errors: errors.array(),
                user: req.user || null,
                formData: req.body,
                successMessage: null,
            });
        }

        const { email, password } = req.body;
        try {
            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).render("login", {
                    title: "Login",
                    errors: [{ msg: "Invalid email or password." }],
                    user: req.user || null,
                    formData: req.body,
                    successMessage: null,
                });
            }

            // Verify password match
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).render("login", {
                    title: "Login",
                    errors: [{ msg: "Invalid email or password." }],
                    user: req.user || null,
                    formData: req.body,
                    successMessage: null,
                });
            }

            // Generate JWT token with user info and 2-hour expiry
            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role, name: user.name },
                process.env.JWT_SECRET,
                { expiresIn: "2h" }
            );

            // Set token in secure, HTTP-only cookie and redirect based on role
            res
                .cookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 2 * 60 * 60 * 1000, // 2 hours
                })
                .status(200)
                .redirect(user.role === "admin" ? "/dashboard/admin" : "/dashboard/user");

        } catch (err) {
            console.error("Login error:", err);
            res.status(500).render("login", {
                title: "Login",
                errors: [{ msg: "Server error. Please try again later." }],
                user: req.user || null,
                formData: req.body,
                successMessage: null,
            });
        }
    }
);

/**
 * POST /logout
 * Clears the authentication token cookie and redirects to login page.
 * Allows users to securely log out.
 */
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});

module.exports = router;