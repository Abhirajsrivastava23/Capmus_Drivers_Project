const Message = require('../models/Message');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const User = require('../models/User');

// @desc    Get messages for a specific ride between driver and passenger
// @route   GET /api/messages/ride/:rideId
// @access  Private (Confirmed participants only)
exports.getRideMessages = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId).populate('driver_id', 'name phone');

    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    const isDriver = ride.driver_id._id.toString() === req.user._id.toString();

    // Verify user is either the driver or a confirmed passenger
    if (!isDriver) {
      const booking = await Booking.findOne({
        ride_id: rideId,
        passenger_id: req.user._id,
        booking_status: { $in: ['accepted', 'confirmed', 'completed'] },
      });

      if (!booking) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Chat is only available between driver and confirmed passengers.',
        });
      }
    }

    const messages = await Message.find({ ride_id: rideId })
      .populate('sender_id', 'name student_id')
      .populate('receiver_id', 'name student_id')
      .sort({ sent_at: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
      ride: {
        _id: ride._id,
        destination: ride.destination,
        journey_date: ride.journey_date,
        departure_time: ride.departure_time,
        driver: {
          _id: ride.driver_id._id,
          name: ride.driver_id.name,
          phone: ride.driver_id.phone, // Safe to share for confirmed participants
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a chat message
// @route   POST /api/messages/send
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { ride_id, receiver_id, message } = req.body;

    if (!ride_id || !receiver_id || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Ride ID, receiver ID, and message text are required.',
      });
    }

    const newMessage = await Message.create({
      ride_id,
      sender_id: req.user._id,
      receiver_id,
      message: message.trim(),
      sent_at: Date.now(),
    });

    await newMessage.populate('sender_id', 'name student_id');
    await newMessage.populate('receiver_id', 'name student_id');

    // Emit via Socket.io if io instance is attached to app
    const io = req.app.get('io');
    if (io) {
      io.to(`ride_${ride_id}`).emit('new_message', newMessage);
      io.to(`user_${receiver_id}`).emit('direct_message', newMessage);
    }

    res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (err) {
    next(err);
  }
};
