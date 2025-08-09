// Import of necessary Mongoose models
const Flight = require("../models/Flight");
const Booking = require("../models/Booking");

/**
 * Book a flight for a user.
 * Ensures only authenticated users with 'user' role can book.
 * Verifies fight exists, has enough seats, and user hasn't already booked it.
 */
exports.bookFlight = async (req, res) => {
  try {
    // Allow only logged-in users with the 'user' role to book
    if (!req.user || req.user.role !== 'user') {
      return res.status(403).json({ message: "Only users can book flights." });
    }

    const { flightId, seatsBooked = 1 } = req.body; // Default to booking 1 seat
    const userId = req.user._id;

    // Check if flight exists
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: "Flight not found." });
    }

    // Ensure enough seats are available
    if (flight.availableSeats < seatsBooked) {
      return res.status(400).json({ message: "Not enough available seats." });
    }

    // Prevent duplicate bookings for the same flight by same user
    const existingBooking = await Booking.findOne({ user: userId, flight: flightId });
    if (existingBooking) {
      return res.status(400).json({ message: "You have already booked this flight." });
    }

    // Create a new booking
    const booking = new Booking({
      user: userId,
      flight: flightId,
      seatsBooked: seatsBooked,
    });
    await booking.save();

    // Decrement available seats on the flight
    flight.availableSeats -= seatsBooked;
    await flight.save();

    res.status(201).json({ message: "Booking successful!", booking });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * Cancel and existing booking.
 * Restores the booked seats back to the flight.
 */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    // Restore the seats back to the flight
    const flight = await Flight.findById(booking.flight);
    if (flight) {
      flight.availableSeats += booking.seatsBooked;
      await flight.save();
    }

    await booking.deleteOne();

    res.status(200).json({ message: "Booking cancelled." });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * GET: Paginated list of bookings.
 * Allows optional searching by user name, email, or flight number.
 * Joins booking with user and flight collection using aggregation.
 */
exports.getBookingsPaginated = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const searchRegex = new RegExp(search, 'i');

    // Aggregation pipeline to join related user and flight data
    const aggregatePipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        }
      },
      {
        $lookup: {
          from: 'flights',
          localField: 'flight',
          foreignField: '_id',
          as: 'flight',
        }
      },
      { $unwind: '$user' }, // Flatten joined user
      // Flatten flight, and exclude if flight reference is missing
      { $unwind: { path: '$flight', preserveNullAndEmptyArrays: false } },
      {
        $match: {
            // Allow filtering by user name, email, or flight number
          $or: [
            { 'user.name': searchRegex },
            { 'user.email': searchRegex },
            { 'flight.flightNumber': searchRegex }
          ]
        }
      },
      { $sort: { createdAt: -1 } },  // Newest first
      { $skip: (page - 1) * limit },  // Pagination offset
      { $limit: limit },
      {
        // Limit fields returned to reduce payload size
        $project: {
          _id: 1,
          seatsBooked: 1,
          createdAt: 1,
          'user.name': 1,
          'user.email': 1,
          'flight.flightNumber': 1,
          'flight.origin': 1,
          'flight.destination': 1,
          'flight.departureTime': 1,
          'flight.arrivalTime': 1,
        }
      }
    ];

    const bookings = await Booking.aggregate(aggregatePipeline);

    // Duplicate aggregation to get total count (without pagination)
    const countPipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        }
      },
      {
        $lookup: {
          from: 'flights',
          localField: 'flight',
          foreignField: '_id',
          as: 'flight',
        }
      },
      { $unwind: '$user' },
      { $unwind: { path: '$flight', preserveNullAndEmptyArrays: false } },
      {
        $match: {
          $or: [
            { 'user.name': searchRegex },
            { 'user.email': searchRegex },
            { 'flight.flightNumber': searchRegex }
          ]
        }
      },
      { $count: 'total' }
    ];

    const totalCountResult = await Booking.aggregate(countPipeline);
    const total = totalCountResult[0] ? totalCountResult[0].total : 0;

    res.json({
      bookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching paginated bookings:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * Utility function to clean up "orphaned" bookings.
 * These are bookings that reference a flight that no longer exists.
 * This helps database hygiene if flights are deleted directly.
 */
exports.cleanupOrphanedBookings = async () => {
  try {
    const result = await Booking.deleteMany({
      flight: { $exists: true, $eq: null }
    });
    console.log(`Orphaned bookings cleanup: deleted ${result.deletedCount} documents.`);
  } catch (err) {
    console.error("Error cleaning orphaned bookings:", err);
  }
};