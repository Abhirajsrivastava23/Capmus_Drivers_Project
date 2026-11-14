const crypto = require('crypto');
const Ride = require('../models/Ride');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const User = require('../models/User');
const RideRequest = require('../models/RideRequest');
const { logAudit } = require('../middleware/auditLogger');

// @desc    Offer a new ride
// @route   POST /api/rides
// @access  Private (Verified Student)
exports.offerRide = async (req, res, next) => {
  try {
    const {
      source,
      destination,
      pickup_location,
      drop_location,
      journey_date,
      departure_time,
      expected_arrival,
      available_seats,
      cost_per_seat,
      ac_available,
      luggage_capacity,
      instructions,
      // Vehicle details (either existing vehicle_id or new vehicle info)
      vehicle_id,
      vehicle_model,
      registration_number,
      colour,
      vehicle_type,
    } = req.body;

    // Validate essential fields
    if (!destination || !pickup_location || !drop_location || !journey_date || !departure_time || !available_seats || cost_per_seat === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required ride details (destination, pickup, drop, date, departure time, seats, and cost).',
      });
    }

    let vehicle;
    if (vehicle_id) {
      vehicle = await Vehicle.findById(vehicle_id);
      if (!vehicle || vehicle.owner_id.toString() !== req.user._id.toString()) {
        return res.status(404).json({ success: false, message: 'Specified vehicle not found or unauthorized.' });
      }
    } else {
      // Create or update vehicle
      if (!vehicle_model || !registration_number || !colour) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle model, colour, and registration number (e.g. UP32 AB 1234) are required.',
        });
      }

      const cleanReg = registration_number.toUpperCase().trim();
      vehicle = await Vehicle.findOne({ registration_number: cleanReg });

      if (vehicle) {
        if (vehicle.owner_id.toString() !== req.user._id.toString()) {
          return res.status(400).json({
            success: false,
            message: 'This vehicle registration number is already registered by another student.',
          });
        }
        vehicle.vehicle_model = vehicle_model;
        vehicle.colour = colour;
        vehicle.vehicle_type = vehicle_type || 'Hatchback';
        vehicle.ac_available = ac_available !== undefined ? ac_available : true;
        vehicle.luggage_capacity = luggage_capacity || 'Medium Luggage';
        await vehicle.save();
      } else {
        vehicle = await Vehicle.create({
          owner_id: req.user._id,
          vehicle_model: vehicle_model.trim(),
          registration_number: cleanReg,
          colour: colour.trim(),
          vehicle_type: vehicle_type || 'Hatchback',
          ac_available: ac_available !== undefined ? ac_available : true,
          luggage_capacity: luggage_capacity || 'Medium Luggage',
          verification_status: 'verified', // Auto-verified for student's registered personal vehicle in MVP
        });
      }
    }

    // Generate unique share token for live tracking sharing
    const shareToken = crypto.randomBytes(16).toString('hex');

    const ride = await Ride.create({
      driver_id: req.user._id,
      vehicle_id: vehicle._id,
      source: source || 'Chandigarh University UP Campus, Lucknow',
      destination: destination.trim(),
      pickup_location: pickup_location.trim(),
      drop_location: drop_location.trim(),
      journey_date: journey_date.trim(),
      departure_time: departure_time.trim(),
      expected_arrival: expected_arrival ? expected_arrival.trim() : '',
      total_seats: Number(available_seats),
      available_seats: Number(available_seats),
      booked_seats: 0,
      cost_per_seat: Number(cost_per_seat),
      ac_available: ac_available !== undefined ? ac_available : true,
      luggage_capacity: luggage_capacity || 'Medium Luggage',
      instructions: instructions ? instructions.trim() : '',
      ride_status: 'published',
      share_token: shareToken,
    });

    // Populate vehicle and driver for immediate UI presentation
    await ride.populate('driver_id', 'name email phone student_id course semester verification_status stats');
    await ride.populate('vehicle_id');

    await logAudit(req, 'RIDE_OFFERED', 'Ride', ride._id, {
      from: ride.source,
      to: ride.destination,
      seats: ride.available_seats,
      cost: ride.cost_per_seat,
      reg: vehicle.registration_number,
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('new_ride_published', ride);
    }

    res.status(201).json({
      success: true,
      message: 'Ride offered successfully! Other students can now find and request your ride.',
      ride,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Search available rides with rich filters
// @route   GET /api/rides/search
// @access  Public (can view preview, booking requires verified login)
exports.searchRides = async (req, res, next) => {
  try {
    if (require('mongoose').connection.readyState !== 1) {
      return res.status(200).json({ success: true, count: 0, rides: [] });
    }

    const {
      destination,
      journey_date,
      seats,
      max_cost,
      ac_only,
      departure_time_slot, // 'morning', 'afternoon', 'evening'
    } = req.query;

    const query = {
      ride_status: 'published',
      available_seats: { $gt: 0 }, // Automatically hide completely reserved rides
    };

    if (destination && destination.trim() !== '' && destination.toLowerCase() !== 'all') {
      query.destination = new RegExp(destination.trim(), 'i');
    }

    if (journey_date && journey_date.trim() !== '') {
      query.journey_date = journey_date.trim();
    }

    if (seats) {
      const minSeats = Number(seats);
      if (minSeats > 0) {
        query.available_seats.$gte = minSeats;
      }
    }

    if (max_cost) {
      query.cost_per_seat = { $lte: Number(max_cost) };
    }

    if (ac_only === 'true') {
      query.ac_available = true;
    }

    const rides = await Ride.find(query)
      .populate('driver_id', 'name student_id course semester verification_status stats profile_photo')
      .populate('vehicle_id')
      .sort({ createdAt: -1 });

    // Format rides with protected privacy (do not disclose mobile number prior to booking confirmation)
    const formattedRides = rides.map((ride) => {
      const rideObj = ride.toObject();
      return {
        _id: rideObj._id,
        source: rideObj.source,
        destination: rideObj.destination,
        pickup_location: rideObj.pickup_location,
        drop_location: rideObj.drop_location,
        journey_date: rideObj.journey_date,
        departure_time: rideObj.departure_time,
        expected_arrival: rideObj.expected_arrival,
        available_seats: rideObj.available_seats,
        total_seats: rideObj.total_seats,
        cost_per_seat: rideObj.cost_per_seat,
        ac_available: rideObj.ac_available,
        luggage_capacity: rideObj.luggage_capacity,
        instructions: rideObj.instructions,
        ride_status: rideObj.ride_status,
        driver: {
          _id: rideObj.driver_id?._id,
          name: rideObj.driver_id?.name || 'Student Driver',
          course: rideObj.driver_id?.course,
          semester: rideObj.driver_id?.semester,
          is_verified_student: rideObj.driver_id?.verification_status === 'verified',
          stats: rideObj.driver_id?.stats || {
            average_rating: 5.0,
            completed_rides_as_driver: 0,
            total_reviews: 0,
          },
          // Notice: Phone number is intentionally NOT disclosed here as per security & privacy specs!
        },
        vehicle: {
          model: rideObj.vehicle_id?.vehicle_model || 'Student Car',
          registration_number: rideObj.vehicle_id?.registration_number || 'UP32 AB 1234',
          colour: rideObj.vehicle_id?.colour,
          vehicle_type: rideObj.vehicle_id?.vehicle_type,
        },
      };
    });

    res.status(200).json({
      success: true,
      count: formattedRides.length,
      rides: formattedRides,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get popular campus routes
// @route   GET /api/rides/popular
// @access  Public
exports.getPopularRoutes = async (req, res, next) => {
  try {
    const baseRoutes = [
      { name: 'Kanpur', est_time: '1h 30m', default_cost: 250 },
      { name: 'Unnao', est_time: '30m', default_cost: 80 },
      { name: 'Lucknow', est_time: '45m', default_cost: 120 },
    ];

    const routes = await Promise.all(
      baseRoutes.map(async (route) => {
        // Find minimum cost among all active drivers for this destination
        const minRide = await Ride.findOne({
          destination: new RegExp(route.name, 'i'),
          ride_status: 'published',
          available_seats: { $gt: 0 },
        })
          .sort({ cost_per_seat: 1 })
          .select('cost_per_seat');

        return {
          name: route.name,
          est_time: route.est_time,
          min_cost: minRide ? minRide.cost_per_seat : route.default_cost,
        };
      })
    );

    res.status(200).json({
      success: true,
      routes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single ride details
// @route   GET /api/rides/:id
// @access  Public / Private (shows driver phone if confirmed booking exists)
exports.getRideById = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver_id', 'name email phone student_id course semester verification_status stats')
      .populate('vehicle_id');

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    // Determine if user has confirmed booking or is the driver to disclose phone
    let canViewPhone = false;
    let userBooking = null;

    if (req.user) {
      if (req.user._id.toString() === ride.driver_id._id.toString()) {
        canViewPhone = true;
      } else {
        userBooking = await Booking.findOne({
          ride_id: ride._id,
          passenger_id: req.user._id,
        });

        if (userBooking && ['confirmed', 'accepted', 'completed'].includes(userBooking.booking_status)) {
          canViewPhone = true;
        }
      }
    }

    const rideObj = ride.toObject();
    const driverData = {
      _id: rideObj.driver_id._id,
      name: rideObj.driver_id.name,
      course: rideObj.driver_id.course,
      semester: rideObj.driver_id.semester,
      student_id: rideObj.driver_id.student_id,
      is_verified_student: rideObj.driver_id.verification_status === 'verified',
      phone: canViewPhone ? rideObj.driver_id.phone : `${rideObj.driver_id.phone?.slice(0, 3)}****${rideObj.driver_id.phone?.slice(-3)}`,
      isPhoneRevealed: canViewPhone,
      stats: rideObj.driver_id.stats,
    };

    res.status(200).json({
      success: true,
      ride: {
        ...rideObj,
        driver: driverData,
      },
      userBooking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update ride details / Change departure time
// @route   PUT /api/rides/:id
// @access  Private (Driver only)
exports.updateRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (ride.driver_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You are not the driver of this ride.' });
    }

    const { departure_time, available_seats, expected_arrival, instructions, cost_per_seat } = req.body;

    let timeChanged = false;
    const oldTime = ride.departure_time;

    if (departure_time && departure_time !== ride.departure_time) {
      ride.departure_time = departure_time;
      timeChanged = true;
    }

    if (available_seats !== undefined) {
      const seats = Number(available_seats);
      if (seats < 0) {
        return res.status(400).json({ success: false, message: 'Available seats cannot be negative.' });
      }
      ride.available_seats = seats;
    }

    if (expected_arrival !== undefined) ride.expected_arrival = expected_arrival;
    if (instructions !== undefined) ride.instructions = instructions;
    if (cost_per_seat !== undefined) ride.cost_per_seat = Number(cost_per_seat);

    await ride.save();

    // If departure time changed, notify all confirmed passengers!
    if (timeChanged) {
      const bookings = await Booking.find({
        ride_id: ride._id,
        booking_status: { $in: ['accepted', 'confirmed'] },
      });

      for (const booking of bookings) {
        await Notification.create({
          user_id: booking.passenger_id,
          title: 'Departure Time Changed',
          body: `Driver has updated departure time for your ride to ${ride.destination} from ${oldTime} to ${ride.departure_time}.`,
          type: 'departure_time_changed',
          data: { ride_id: ride._id, new_time: ride.departure_time },
        });
      }
    }

    await logAudit(req, 'RIDE_UPDATED', 'Ride', ride._id, { departure_time, available_seats });

    res.status(200).json({
      success: true,
      message: 'Ride details updated successfully.',
      ride,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark journey as Started
// @route   PUT /api/rides/:id/start
// @access  Private (Driver only)
exports.startRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.driver_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Driver only.' });
    }

    ride.ride_status = 'started';
    ride.started_at = Date.now();
    await ride.save();

    // Notify all confirmed passengers
    const bookings = await Booking.find({
      ride_id: ride._id,
      booking_status: { $in: ['accepted', 'confirmed'] },
    });

    for (const booking of bookings) {
      await Notification.create({
        user_id: booking.passenger_id,
        title: 'Journey Started! 🚗',
        body: `Your ride to ${ride.destination} has officially started! Have a safe and pleasant journey.`,
        type: 'ride_started',
        data: { ride_id: ride._id },
      });
    }

    await logAudit(req, 'RIDE_STARTED', 'Ride', ride._id);

    res.status(200).json({
      success: true,
      message: 'Journey marked as Started. Live location tracking active.',
      ride,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark journey as Completed
// @route   PUT /api/rides/:id/complete
// @access  Private (Driver only)
exports.completeRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.driver_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Driver only.' });
    }

    ride.ride_status = 'completed';
    ride.completed_at = Date.now();
    await ride.save();

    // Increment completed rides count for driver
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.completed_rides_as_driver': 1 },
    });

    // Mark all confirmed bookings as completed and notify passengers to submit 5-star review
    const bookings = await Booking.find({
      ride_id: ride._id,
      booking_status: { $in: ['accepted', 'confirmed'] },
    });

    for (const booking of bookings) {
      booking.booking_status = 'completed';
      await booking.save();

      // Increment completed count for passenger
      await User.findByIdAndUpdate(booking.passenger_id, {
        $inc: { 'stats.completed_rides_as_passenger': 1 },
      });

      // Send review prompt notification
      await Notification.create({
        user_id: booking.passenger_id,
        title: 'Rate Your Driving Experience ⭐',
        body: `You have arrived at ${ride.destination}! Please rate your driver's safety, behaviour, and punctuality.`,
        type: 'ride_completed',
        data: { ride_id: ride._id, booking_id: booking._id },
      });
    }

    await logAudit(req, 'RIDE_COMPLETED', 'Ride', ride._id);

    res.status(200).json({
      success: true,
      message: 'Ride successfully marked as Completed! Thank you for sharing your ride.',
      ride,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel ride with cancellation reason
// @route   PUT /api/rides/:id/cancel
// @access  Private (Driver only)
exports.cancelRide = async (req, res, next) => {
  try {
    const { cancellation_reason } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.driver_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Driver only.' });
    }

    ride.ride_status = 'cancelled';
    ride.cancellation_reason = cancellation_reason || 'Driver cancelled the ride.';
    await ride.save();

    // Cancel all active bookings and notify passengers
    const bookings = await Booking.find({
      ride_id: ride._id,
      booking_status: { $in: ['pending', 'accepted', 'confirmed'] },
    });

    for (const booking of bookings) {
      booking.booking_status = 'cancelled';
      booking.cancellation_reason = `Driver cancelled: ${cancellation_reason || 'Schedule change'}`;
      booking.cancelled_by = req.user._id;
      await booking.save();

      await Notification.create({
        user_id: booking.passenger_id,
        title: 'Ride Cancelled by Driver',
        body: `Your ride to ${ride.destination} on ${ride.journey_date} was cancelled. Reason: ${cancellation_reason || 'Unforeseen circumstances'}.`,
        type: 'ride_cancelled',
        data: { ride_id: ride._id },
      });
    }

    await logAudit(req, 'RIDE_CANCELLED', 'Ride', ride._id, { reason: cancellation_reason });

    res.status(200).json({
      success: true,
      message: 'Ride has been cancelled and booked passengers have been notified.',
      ride,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get published rides for current driver
// @route   GET /api/rides/driver/my-rides
// @access  Private
exports.getMyPublishedRides = async (req, res, next) => {
  try {
    const rides = await Ride.find({ driver_id: req.user._id })
      .populate('vehicle_id')
      .sort({ createdAt: -1 });

    // Attach pending requests count to each ride
    const ridesWithCounts = await Promise.all(
      rides.map(async (ride) => {
        const pendingCount = await Booking.countDocuments({
          ride_id: ride._id,
          booking_status: 'pending',
        });
        const confirmedCount = await Booking.countDocuments({
          ride_id: ride._id,
          booking_status: { $in: ['accepted', 'confirmed'] },
        });

        return {
          ...ride.toObject(),
          pending_requests_count: pendingCount,
          confirmed_passengers_count: confirmedCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      rides: ridesWithCounts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Broadcast a ride request to all registered drivers
// @route   POST /api/rides/broadcast-request
// @access  Public or Protected
exports.broadcastRideRequest = async (req, res, next) => {
  try {
    const {
      destination,
      seats = 1,
      passenger_name,
      passenger_phone,
      source = 'Chandigarh University UP Campus, Lucknow',
    } = req.body;

    if (!destination || destination.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Destination is required for ride request broadcast',
      });
    }

    const passengerId = req.user ? req.user._id : null;
    const name = req.user?.name || passenger_name || 'Ananya Gupta';
    const phone = req.user?.phone || passenger_phone || '9876500002';

    const rideReq = await RideRequest.create({
      passenger_id: passengerId,
      passenger_name: name,
      passenger_phone: phone,
      passenger_course: req.user?.course || 'B.Tech CSE - 4th Sem',
      source: source || 'Chandigarh University UP Campus, Lucknow',
      destination: destination.trim(),
      seats: Number(seats) || 1,
      status: 'pending',
      estimated_contribution: destination.toLowerCase().includes('kanpur')
        ? 250
        : destination.toLowerCase().includes('unnao')
        ? 80
        : 120,
    });

    // Notify all registered drivers in the database
    const drivers = await User.find({
      $or: [{ role: 'driver' }, { is_driver_approved: true }],
    });

    const notifPromises = drivers.map((driver) =>
      Notification.create({
        user_id: driver._id,
        title: `🚗 New Ride Request: ${destination.trim()}`,
        body: `${name} is looking for a ride from CUUP Campus to ${destination.trim()}! Tap to accept and offer a ride.`,
        type: 'ride_broadcast',
        data: {
          request_id: rideReq._id,
          destination: destination.trim(),
          passenger_name: name,
          passenger_phone: phone,
        },
      })
    );
    await Promise.allSettled(notifPromises);

    // Emit Real-time Socket.IO Broadcast
    const io = req.app.get('io');
    if (io) {
      io.emit('new_student_ride_request', {
        request_id: rideReq._id,
        destination: destination.trim(),
        passenger_name: name,
        source: rideReq.source,
        seats: rideReq.seats,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(201).json({
      success: true,
      message: `Notification broadcasted to ${drivers.length} registered campus drivers!`,
      request: rideReq,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all active student ride requests
// @route   GET /api/rides/broadcast-requests
// @access  Public
exports.getActiveRideRequests = async (req, res, next) => {
  try {
    if (require('mongoose').connection.readyState !== 1) {
      return res.status(200).json({ success: true, count: 0, requests: [] });
    }

    const requests = await RideRequest.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(15);

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Driver accepts a student's ride request
// @route   POST /api/rides/broadcast-requests/:id/accept
// @access  Public or Protected
exports.acceptRideRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      driver_name = 'Ananya Sharma',
      driver_phone = '9876500001',
      vehicle_info = 'Hyundai i10 (UP32 AB 1234)',
    } = req.body;

    const rideReq = await RideRequest.findById(id);
    if (!rideReq) {
      return res.status(404).json({
        success: false,
        message: 'Ride request not found or expired',
      });
    }

    if (rideReq.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This ride request is already ${rideReq.status}`,
      });
    }

    const driverId = req.user ? req.user._id : null;
    const finalDriverName = req.user?.name || driver_name || 'Ananya Sharma';
    const finalDriverPhone = req.user?.phone || driver_phone || '9876500001';

    rideReq.status = 'accepted';
    rideReq.driver_id = driverId;
    rideReq.driver_name = finalDriverName;
    rideReq.driver_phone = finalDriverPhone;
    rideReq.vehicle_info = vehicle_info;
    await rideReq.save();

    // If passenger is a registered user, send them a confirmation notification
    if (rideReq.passenger_id) {
      await Notification.create({
        user_id: rideReq.passenger_id,
        title: '🎉 Driver Accepted Your Ride Request!',
        body: `Driver ${finalDriverName} accepted your ride to ${rideReq.destination}! Call: ${finalDriverPhone}. Car: ${vehicle_info}`,
        type: 'booking_accepted',
        data: {
          request_id: rideReq._id,
          driver_name: finalDriverName,
          driver_phone: finalDriverPhone,
          vehicle_info,
        },
      });
    }

    // Emit Real-time Socket.IO update
    const io = req.app.get('io');
    if (io) {
      io.emit('ride_request_accepted', {
        request_id: rideReq._id,
        driver_name: finalDriverName,
        driver_phone: finalDriverPhone,
        vehicle_info,
        status: 'accepted',
      });
    }

    res.status(200).json({
      success: true,
      message: `You have accepted the ride request for ${rideReq.passenger_name}!`,
      request: rideReq,
    });
  } catch (err) {
    next(err);
  }
};
