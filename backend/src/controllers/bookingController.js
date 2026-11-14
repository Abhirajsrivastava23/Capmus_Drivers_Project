const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');
const { logAudit } = require('../middleware/auditLogger');

// @desc    Request to book seats in a ride
// @route   POST /api/bookings
// @access  Private (Verified Student)
exports.createBooking = async (req, res, next) => {
  try {
    const { ride_id, seats_booked, pickup_note } = req.body;
    const requestedSeats = Number(seats_booked) || 1;

    if (!ride_id) {
      return res.status(400).json({ success: false, message: 'Ride ID is required.' });
    }

    if (requestedSeats < 1) {
      return res.status(400).json({ success: false, message: 'Must book at least 1 seat.' });
    }

    const ride = await Ride.findById(ride_id).populate('driver_id', 'name email phone');

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    if (ride.ride_status !== 'published') {
      return res.status(400).json({
        success: false,
        message: `This ride is currently ${ride.ride_status} and cannot accept new bookings.`,
      });
    }

    // Check seat availability
    if (ride.available_seats < requestedSeats) {
      return res.status(400).json({
        success: false,
        message: `Only ${ride.available_seats} seat(s) remaining for this ride.`,
      });
    }

    // Check if passenger already has an active booking for this ride
    const existingBooking = await Booking.findOne({
      ride_id: ride._id,
      passenger_id: req.user._id,
      booking_status: { $in: ['pending', 'accepted', 'confirmed'] },
    });

    if (existingBooking) {
      return res.status(200).json({
        success: true,
        message: `You already have an active ${existingBooking.booking_status} booking for this ride.`,
        booking: existingBooking,
      });
    }

    const totalCost = requestedSeats * ride.cost_per_seat;

    // Direct confirmed reservation when requested
    const isAutoConfirm = req.body.auto_confirm === true;
    let bookingStatus = 'pending';

    if (isAutoConfirm) {
      const updatedRide = await Ride.findOneAndUpdate(
        {
          _id: ride._id,
          available_seats: { $gte: requestedSeats },
        },
        {
          $inc: {
            available_seats: -requestedSeats,
            booked_seats: requestedSeats,
          },
        },
        { new: true }
      );

      if (!updatedRide) {
        return res.status(400).json({
          success: false,
          message: `Only ${ride.available_seats} seat(s) remaining for this ride.`,
        });
      }

      bookingStatus = 'confirmed';

      // Notify clients of updated seats
      const io = req.app.get('io');
      if (io) {
        io.emit('ride_seats_updated', {
          ride_id: ride._id,
          available_seats: updatedRide.available_seats,
          booked_seats: updatedRide.booked_seats,
        });
      }
    }

    // Create booking
    const booking = await Booking.create({
      ride_id: ride._id,
      passenger_id: req.user._id,
      driver_id: ride.driver_id._id,
      seats_booked: requestedSeats,
      total_cost: totalCost,
      booking_status: bookingStatus,
      payment_status: 'unpaid',
      pickup_note: pickup_note ? pickup_note.trim() : '',
    });

    // Notify driver about incoming or confirmed booking
    await Notification.create({
      user_id: ride.driver_id._id,
      title: isAutoConfirm ? 'Seat Booked in Your Ride! 🚗' : 'New Ride Booking Request! 🙋',
      body: `${req.user.name} (${req.user.course}) ${isAutoConfirm ? 'booked' : 'requested'} ${requestedSeats} seat(s) for your trip to ${ride.destination}.`,
      type: 'booking_request',
      data: {
        booking_id: booking._id,
        ride_id: ride._id,
        passenger_name: req.user.name,
        seats: requestedSeats,
      },
    });

    await logAudit(req, isAutoConfirm ? 'BOOKING_CONFIRMED' : 'BOOKING_REQUESTED', 'Booking', booking._id, {
      ride_id: ride._id,
      seats: requestedSeats,
      cost: totalCost,
    });

    res.status(201).json({
      success: true,
      message: 'Booking request sent to the driver! You will be notified once the driver accepts.',
      booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Driver accepts a booking request (Atomically reserves seats)
// @route   PUT /api/bookings/:id/accept
// @access  Private (Driver only)
exports.acceptBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('passenger_id', 'name phone email course semester')
      .populate('ride_id');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found.' });
    }

    if (booking.driver_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Driver only.' });
    }

    if (booking.booking_status === 'confirmed') {
      return res.status(200).json({
        success: true,
        message: 'Booking is already confirmed.',
        booking,
        remaining_seats: booking.ride_id.available_seats,
      });
    }

    if (booking.booking_status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Booking has already been ${booking.booking_status}.`,
      });
    }

    // Atomic seat decrement with condition to prevent double booking & race conditions
    const updatedRide = await Ride.findOneAndUpdate(
      {
        _id: booking.ride_id._id,
        available_seats: { $gte: booking.seats_booked },
      },
      {
        $inc: {
          available_seats: -booking.seats_booked,
          booked_seats: booking.seats_booked,
        },
      },
      { new: true }
    );

    if (!updatedRide) {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept request: Not enough seats remaining on this ride.',
      });
    }

    booking.booking_status = 'confirmed';
    await booking.save();

    // Notify passenger with confirmation & reveal driver details
    await Notification.create({
      user_id: booking.passenger_id._id,
      title: 'Booking Confirmed! 🎉',
      body: `Your booking for ${booking.seats_booked} seat(s) to ${updatedRide.destination} has been accepted by ${req.user.name}. Driver contact details are now unlocked.`,
      type: 'booking_accepted',
      data: {
        booking_id: booking._id,
        ride_id: updatedRide._id,
        driver_phone: req.user.phone,
      },
    });

    await logAudit(req, 'BOOKING_ACCEPTED', 'Booking', booking._id, {
      remaining_seats: updatedRide.available_seats,
    });

    res.status(200).json({
      success: true,
      message: 'Booking request accepted and seats confirmed!',
      booking,
      remaining_seats: updatedRide.available_seats,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Driver rejects a booking request
// @route   PUT /api/bookings/:id/reject
// @access  Private (Driver only)
exports.rejectBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('ride_id');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found.' });
    }

    if (booking.driver_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Driver only.' });
    }

    if (booking.booking_status === 'confirmed') {
      return res.status(200).json({
        success: true,
        message: 'Booking is already confirmed.',
        booking,
        remaining_seats: booking.ride_id.available_seats,
      });
    }

    if (booking.booking_status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Booking has already been ${booking.booking_status}.`,
      });
    }

    booking.booking_status = 'rejected';
    booking.cancellation_reason = reason || 'Driver declined the request.';
    await booking.save();

    // Notify passenger
    await Notification.create({
      user_id: booking.passenger_id,
      title: 'Booking Request Declined',
      body: `Your request for the ride to ${booking.ride_id.destination} was not accepted. Reason: ${reason || 'Seat not available'}.`,
      type: 'booking_rejected',
      data: { booking_id: booking._id, ride_id: booking.ride_id._id },
    });

    await logAudit(req, 'BOOKING_REJECTED', 'Booking', booking._id, { reason });

    res.status(200).json({
      success: true,
      message: 'Booking request rejected.',
      booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Passenger cancels a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Passenger only)
exports.cancelBooking = async (req, res, next) => {
  try {
    const { cancellation_reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('ride_id');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.passenger_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
    }

    if (['cancelled', 'completed', 'rejected'].includes(booking.booking_status)) {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.booking_status}.`,
      });
    }

    const wasConfirmed = ['accepted', 'confirmed'].includes(booking.booking_status);

    booking.booking_status = 'cancelled';
    booking.cancellation_reason = cancellation_reason || 'Cancelled by passenger';
    booking.cancelled_by = req.user._id;
    await booking.save();

    // If booking was confirmed, atomically restore available seats to the ride!
    if (wasConfirmed) {
      await Ride.findByIdAndUpdate(booking.ride_id._id, {
        $inc: {
          available_seats: booking.seats_booked,
          booked_seats: -booking.seats_booked,
        },
      });
    }

    // Notify driver about cancellation
    await Notification.create({
      user_id: booking.driver_id,
      title: 'Passenger Cancelled Booking',
      body: `${req.user.name} cancelled their booking for ${booking.seats_booked} seat(s) on your trip to ${booking.ride_id.destination}.`,
      type: 'ride_cancelled',
      data: {
        booking_id: booking._id,
        ride_id: booking.ride_id._id,
      },
    });

    await logAudit(req, 'BOOKING_CANCELLED_BY_PASSENGER', 'Booking', booking._id, {
      restored_seats: wasConfirmed ? booking.seats_booked : 0,
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been released.',
      booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get passenger's bookings (My Bookings)
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ passenger_id: req.user._id })
      .populate({
        path: 'ride_id',
        populate: [
          { path: 'driver_id', select: 'name email phone student_id course semester verification_status stats' },
          { path: 'vehicle_id', select: 'vehicle_model registration_number colour vehicle_type' },
        ],
      })
      .sort({ createdAt: -1 });

    // Format so driver phone is only exposed if booking is accepted, confirmed or completed
    const formatted = bookings.map((b) => {
      const bObj = b.toObject();
      const isConfirmed = ['accepted', 'confirmed', 'completed'].includes(bObj.booking_status);
      if (bObj.ride_id && bObj.ride_id.driver_id) {
        if (!isConfirmed) {
          bObj.ride_id.driver_id.phone = `${bObj.ride_id.driver_id.phone?.slice(0, 3)}****${bObj.ride_id.driver_id.phone?.slice(-3)}`;
        }
        bObj.driver_contact_unlocked = isConfirmed;
      }
      return bObj;
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      bookings: formatted,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get incoming booking requests for a specific ride or all rides (Driver view)
// @route   GET /api/bookings/ride/:rideId
// @access  Private (Driver only)
exports.getRideBookings = async (req, res, next) => {
  try {
    let query = {};
    if (req.params.rideId && req.params.rideId !== 'all' && req.params.rideId !== 'undefined') {
      const ride = await Ride.findById(req.params.rideId);
      if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

      if (ride.driver_id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized: Driver only.' });
      }
      query.ride_id = ride._id;
    } else {
      query.driver_id = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate('passenger_id', 'name email phone student_id course semester verification_status stats profile_photo')
      .populate('ride_id', 'departure_time destination from cost_per_seat ride_status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Declare payment status (Cash or UPI)
// @route   PUT /api/bookings/:id/payment
// @access  Private
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { payment_method, upi_reference } = req.body;
    const booking = await Booking.findById(req.params.id).populate('ride_id');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.passenger_id.toString() !== req.user._id.toString() && booking.driver_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const statusValue = payment_method === 'cash' ? 'cash_declared' : 'upi_declared';
    booking.payment_status = statusValue;
    if (upi_reference) booking.payment_reference = upi_reference;
    await booking.save();

    await Payment.create({
      booking_id: booking._id,
      ride_id: booking.ride_id._id,
      passenger_id: booking.passenger_id,
      driver_id: booking.driver_id,
      amount: booking.total_cost,
      method: payment_method || 'upi',
      upi_transaction_id: upi_reference || '',
      status: 'declared',
    });

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${statusValue}.`,
      booking,
    });
  } catch (err) {
    next(err);
  }
};
