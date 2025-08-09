// Import of necessary Mongoose models
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');

// CREATE: A new flight (Admin only)
// Validates that arrival time is not before departure
exports.createFlight = async (req, res) => {
    try {
        const { departureTime, arrivalTime } = req.body;

        // Basic validation: Ensure arrival time is after departure
        if (new Date(arrivalTime) < new Date(departureTime)) {
            return res.status(400).json({ message: "Arrival time cannot be before departure time." });
        }

        const newFlight = new Flight(req.body);
        await newFlight.save();
        res.status(201).json(newFlight);  // Return newly created flight
    } catch (err) {
        console.error("Create Flight Error:", err);
        res.status(500).json ({ message: "Server error." });
    }
};

// READ: Fetch all flights (non-paginated, used internally/admin)
exports.getAllFlights = async (req, res) => {
    try{
        const flights = await Flight.find();
        res.status(200).json(flights);
    } catch (err) {
        console.error("Get Flights Error:", err);
        res.status(500).json({ message: "Server error." });
    }
};

// READ: Get a single flight by its MongoDB ID
exports.getFlightById = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            return res.status(400).json({ message: "Flight not found." });
        }
        res.status(200).json(flight);
    } catch (err) {
        console.error("Get Flight Error:", err);
        res.status(500).json({ message: "Server error." });
    }
};

// UPDATE: A flight (Admin only)
// Validates arrival time and updates the flight using request body
exports.updateFlight = async (req, res) => {
    try {
        const { departureTime, arrivalTime } = req.body;

        // Ensure arrival is not before departure
        if (new Date(arrivalTime) < new Date(departureTime)) {
            return res.status(400).json({ message: "Arrival time cannot be before departure time." });
        }

        // Find flight and apply updates
        const updated = await Flight.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }  // Return updated flight and validate fields
        );
        if (!updated) {
            return res.status(404).json({ message: "Flight not found." });
        }
        res.status(200).json(updated);
    } catch (err) {
        console.error("Update Flight Error:", err);
        return res.status(500).json({ message: "Server error." });
    }
};

// DELETE: A flight (Admin only)
// Also deletes associated bookings to maintain data integrity
exports.deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: "Flight not found." });
    }
    
    // Delete all bookings associated with this flight
    await Booking.deleteMany({ flight: flight._id });
    
    // Deletes the flight itself
    await flight.remove();

    res.status(200).json({ message: "Flight and associated bookings deleted." });
  } catch (err) {
    console.error("Delete Flight Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET (Admin): Fetch flights with pagination + search (i.e., for dashboard)
// Allows filtering by flight number, origin, or destination
exports.getFlightsPaginated = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Build case-insensitive regex for fuzzy search
    const searchRegex = new RegExp(search, 'i');

    // Apply search to relevant fields
    const filter = {
      $or: [
        { flightNumber: searchRegex },
        { origin: searchRegex },
        { destination: searchRegex }
      ]
    };

    const total = await Flight.countDocuments(filter);  // Total for pagination

    const flights = await Flight.find(filter)
      .sort({ departureTime: 1 })  // Sort by soonest departure
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();  // Convert to plais JS object for performance

    res.json({
      flights,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching paginated flights:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET (Public): Fetch flights with pagination + search for Browse Flights
// Same logic as admin version but uses smaller default limit (5)
exports.getFlightsPaginatedPublic = async (req, res) => {
  try {
    let { page = 1, limit = 5, search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const searchRegex = new RegExp(search, 'i');

    const filter = {
      $or: [
        { flightNumber: searchRegex },
        { origin: searchRegex },
        { destination: searchRegex }
      ]
    };

    const total = await Flight.countDocuments(filter);

    const flights = await Flight.find(filter)
      .sort({ departureTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      flights,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching paginated flights (public):", err);
    res.status(500).json({ message: "Server error." });
  }
};