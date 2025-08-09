const mongoose = require('mongoose');

// Define the schema for the User collection
const UserSchema = new mongoose.Schema({
    // User's full name (required, min 2 characters)
    name: { 
        type: String, 
        required: [true, 'Name is required.'],
        minlength: [2, 'Name must be at least 2 characters.'],
        trim: true
    },

    // User's email address (unique, valid format, and required)
    email: { 
        type: String, 
        required: [true, 'Email is required.'], 
        unique: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address.'],
        lowercase: true
    },

    // User's hashed password (required, min 6 characters)
    password: { 
        type: String, 
        required: [true, 'Password is required.'],
        minlength: [6, 'Password must be at least 6 characters.'] 
    },

    // User role - either 'user' or 'admin'; default to 'user'
    role: {
        type: String,
        enum: ['admin', 'user'],  // Restricts to allowed values
        default: 'user'
    }
});

// Export the User model to be used throughout the application
module.exports = mongoose.model('User', UserSchema);