const mongoose = require('mongoose');

// Define the schema for a flight booking
const BookingSchema = new mongoose.Schema({
    // Reference to the user who made the booking (required)
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    // Reference to the flight being booked (required)
    flight: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Flight', 
        required: true 
    },

    // Number of seats booked for this flight (default = 1, cannot be less than 1)
    seatsBooked: {           
        type: Number,
        default: 1,
        min: 1
    },

    // Timestamp for when the booking was made (defaults to current date/time)
    bookingDate: { 
        type: Date, 
        default: Date.now 
    }
});

// Export the Booking model for use in the application
module.exports = mongoose.model('Booking', BookingSchema);