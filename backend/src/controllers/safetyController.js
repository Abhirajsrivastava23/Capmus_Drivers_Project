const TripLocation = require('../models/TripLocation');
const EmergencyContact = require('../models/EmergencyContact');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const Ride = require('../models/Ride');
const User = require('../models/User');
const { logAudit } = require('../middleware/auditLogger');

// @desc    Trigger Emergency SOS
// @route   POST /api/safety/sos
// @access  Private
exports.triggerSOS = async (req, res, next) => {
  try {
    const { ride_id, latitude, longitude, emergency_message } = req.body;

    const user = await User.findById(req.user._id);
    const emergencyContacts = await EmergencyContact.find({ user_id: req.user._id });

    // Store SOS in audit log
    await logAudit(req, 'SOS_TRIGGERED', 'Safety', req.user._id, {
      latitude,
      longitude,
      ride_id,
      contacts_alerted: emergencyContacts.length,
    });

    // Alert all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user_id: admin._id,
        title: '🚨 CRITICAL EMERGENCY SOS ALERT!',
        body: `Student ${user.name} (${user.student_id}, Phone: ${user.phone}) has triggered emergency SOS. Coordinates: [${latitude || 'Unknown'}, ${longitude || 'Unknown'}].`,
        type: 'sos_alert',
        data: {
          user_id: user._id,
          phone: user.phone,
          latitude,
          longitude,
          ride_id,
        },
      });
    }

    // Emit live SOS on Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('emergency_sos_broadcast', {
        user: { name: user.name, phone: user.phone, student_id: user.student_id },
        location: { latitude, longitude },
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: '🚨 Emergency SOS broadcasted! University Campus Security and Emergency Contacts have been alerted with your location.',
      sosDetails: {
        userName: user.name,
        emergencyContactsNotified: emergencyContacts.map((c) => ({ name: c.name, phone: c.phone_number })),
        policeHelpline: '112',
        womenHelpline: '1090',
        campusSecurityHelpline: '+91 522 6688000',
        coordinates: { latitude, longitude },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update driver live trip GPS location
// @route   POST /api/safety/trip-location
// @access  Private (Driver only)
exports.updateTripLocation = async (req, res, next) => {
  try {
    const { ride_id, latitude, longitude, speed, heading } = req.body;

    if (!ride_id || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Ride ID, latitude, and longitude are required.' });
    }

    const location = await TripLocation.findOneAndUpdate(
      { ride_id },
      {
        driver_id: req.user._id,
        latitude,
        longitude,
        speed: speed || 0,
        heading: heading || 0,
        updated_at: Date.now(),
      },
      { upsert: true, new: true }
    );

    // Broadcast live location over socket room
    const io = req.app.get('io');
    if (io) {
      io.to(`ride_${ride_id}`).emit('trip_location_update', {
        ride_id,
        latitude,
        longitude,
        speed,
        heading,
        updated_at: location.updated_at,
      });
    }

    res.status(200).json({
      success: true,
      location,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get latest GPS location of a ride
// @route   GET /api/safety/trip-location/:rideId
// @access  Private / Public with token
exports.getTripLocation = async (req, res, next) => {
  try {
    const location = await TripLocation.findOne({ ride_id: req.params.rideId });
    if (!location) {
      return res.status(200).json({
        success: true,
        isTracking: false,
        message: 'No live GPS tracking data currently available for this ride.',
      });
    }

    res.status(200).json({
      success: true,
      isTracking: true,
      location,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Public trip sharing link view (for parents and family)
// @route   GET /api/safety/share-trip/:shareToken
// @access  Public
exports.getSharedTrip = async (req, res, next) => {
  try {
    const ride = await Ride.findOne({ share_token: req.params.shareToken })
      .populate('driver_id', 'name student_id verification_status stats')
      .populate('vehicle_id', 'vehicle_model registration_number colour');

    if (!ride) return res.status(404).json({ success: false, message: 'Invalid or expired trip share link.' });

    const latestLocation = await TripLocation.findOne({ ride_id: ride._id });

    res.status(200).json({
      success: true,
      ride: {
        source: ride.source,
        destination: ride.destination,
        journey_date: ride.journey_date,
        departure_time: ride.departure_time,
        ride_status: ride.ride_status,
        driver_name: ride.driver_id.name,
        driver_verified: ride.driver_id.verification_status === 'verified',
        vehicle_model: ride.vehicle_id.vehicle_model,
        vehicle_number: ride.vehicle_id.registration_number,
      },
      latestLocation: latestLocation || null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit report (unsafe driving, suspicious vehicle, fake review, etc.)
// @route   POST /api/safety/report
// @access  Private
exports.submitReport = async (req, res, next) => {
  try {
    const { reported_user_id, ride_id, report_type, reason, details } = req.body;

    if (!reported_user_id || !report_type || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Reported user, report type, and reason are required.',
      });
    }

    const report = await Report.create({
      reporter_id: req.user._id,
      reported_user_id,
      ride_id: ride_id || null,
      report_type,
      reason: reason.trim(),
      details: details ? details.trim() : reason.trim(),
      status: 'pending',
    });

    await logAudit(req, 'USER_REPORTED', 'Report', report._id, {
      reported_user_id,
      report_type,
      reason,
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted safely to Campus Administration. Our safety team will review it immediately.',
      report,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get emergency contacts
// @route   GET /api/safety/emergency-contacts
// @access  Private
exports.getEmergencyContacts = async (req, res, next) => {
  try {
    const contacts = await EmergencyContact.find({ user_id: req.user._id });
    res.status(200).json({ success: true, contacts });
  } catch (err) {
    next(err);
  }
};

// @desc    Add emergency contact
// @route   POST /api/safety/emergency-contacts
// @access  Private
exports.addEmergencyContact = async (req, res, next) => {
  try {
    const { name, relationship, phone_number, is_primary } = req.body;
    if (!name || !phone_number) {
      return res.status(400).json({ success: false, message: 'Name and phone number are required.' });
    }

    const contact = await EmergencyContact.create({
      user_id: req.user._id,
      name: name.trim(),
      relationship: relationship || 'Parent',
      phone_number: phone_number.trim(),
      is_primary: is_primary || false,
    });

    res.status(201).json({ success: true, contact });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete emergency contact
// @route   DELETE /api/safety/emergency-contacts/:id
// @access  Private
exports.deleteEmergencyContact = async (req, res, next) => {
  try {
    await EmergencyContact.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    res.status(200).json({ success: true, message: 'Emergency contact removed.' });
  } catch (err) {
    next(err);
  }
};
