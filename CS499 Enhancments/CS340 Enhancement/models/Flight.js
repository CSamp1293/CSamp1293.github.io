const mongoose = require('mongoose');
const Booking = require('./Booking');

// Define schema for a Flight document in MongoDB
const FlightSchema = new mongoose.Schema({
    // Unique flight number (i.e., "AA123", required)
    flightNumber: { 
        type: String, 
        required: [true, 'Flight number is required.'], 
        unique: true,
        trim: true
    },

    // Origin city/airport of the flight (required)
    origin: { 
        type: String, 
        required: [true, 'Origin is required.'],
        trim: true 
    },

    // Destination city/airport of the flight (required)
    destination: { 
        type: String, 
        required: [true, 'Destination is required.'],
        trim: true
    },

    // Scheduled departure time (required)
    departureTime: { 
        type: Date, 
        required: [true, 'Departure time is required.'] 
    },

    // Scheduled arrival time (required)
    arrivalTime: { 
        type: Date, 
        required: [true, 'Arrival time is required.'] 
    },

    // Number of seats available for booking on the flight (required)
    availableSeats: { 
        type: Number, 
        required: [true, 'Number of seats available is required.'],
        min: [0, 'Seats must be zero or more.'] 
    },

    // Price per seat for the flight (required)
    price: { 
        type: Number, 
        required: [true, 'Flight price is required.'],
        min: [0, 'Price must be zero or more.'] 
    }
});

// Pre-remove middleware to delete all bookings associaetd with a flight
// This ensures data consistency and avoids orphaned bookings
FlightSchema.pre('remove', async function(next) {
  try {
    await Booking.deleteMany({ flight: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

// Export the Flight model based on the schema
module.exports = mongoose.model('Flight', FlightSchema);