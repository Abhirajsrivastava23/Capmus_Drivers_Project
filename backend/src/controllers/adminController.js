const User = require('../models/User');
const StudentVerification = require('../models/StudentVerification');
const Vehicle = require('../models/Vehicle');
const DriverDocument = require('../models/DriverDocument');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { logAudit } = require('../middleware/auditLogger');

// @desc    Get Admin Dashboard Overview Metrics
// @route   GET /api/admin/overview
// @access  Private (Admin only)
exports.getOverview = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: { $in: ['student', 'driver'] } });
    const verifiedStudents = await User.countDocuments({ verification_status: 'verified' });
    const pendingVerifications = await StudentVerification.countDocuments({ status: 'pending' });
    const activeVehicles = await Vehicle.countDocuments({ is_active: true });
    const totalRides = await Ride.countDocuments();
    const activeRides = await Ride.countDocuments({ ride_status: { $in: ['published', 'started'] } });
    const completedRides = await Ride.countDocuments({ ride_status: 'completed' });
    const totalBookings = await Booking.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const flaggedReviews = await Review.countDocuments({ is_reported: true });

    // Recent 5 rides
    const recentRides = await Ride.find()
      .populate('driver_id', 'name student_id')
      .populate('vehicle_id', 'vehicle_model registration_number')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent 5 reports
    const recentReports = await Report.find()
      .populate('reporter_id', 'name student_id')
      .populate('reported_user_id', 'name student_id phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      metrics: {
        totalStudents,
        verifiedStudents,
        pendingVerifications,
        activeVehicles,
        totalRides,
        activeRides,
        completedRides,
        totalBookings,
        pendingReports,
        flaggedReviews,
      },
      recentRides,
      recentReports,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get students list
// @route   GET /api/admin/students
// @access  Private (Admin only)
exports.getStudents = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = { role: { $ne: 'admin' } };

    if (status) query.verification_status = status;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { student_id: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }

    const students = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify or reject student ID
// @route   PUT /api/admin/students/:id/verify
// @access  Private (Admin only)
exports.verifyStudentId = async (req, res, next) => {
  try {
    const { status, notes } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    student.verification_status = status === 'approved' ? 'verified' : 'rejected';
    await student.save();

    // Update StudentVerification record
    await StudentVerification.findOneAndUpdate(
      { user_id: student._id },
      {
        status,
        reviewed_by: req.user._id,
        review_notes: notes || '',
        reviewed_at: Date.now(),
      }
    );

    // Send notification to student
    await Notification.create({
      user_id: student._id,
      title: status === 'approved' ? 'ID Verified! 🎓' : 'ID Verification Declined',
      body:
        status === 'approved'
          ? 'Congratulations! Your Chandigarh University Student ID has been verified. You can now offer and book carpool rides.'
          : `Your Student ID verification was rejected. Reason: ${notes || 'Document unreadable or invalid'}. Please re-upload.`,
      type: 'verification_update',
    });

    await logAudit(req, `STUDENT_${status.toUpperCase()}`, 'User', student._id, { notes });

    res.status(200).json({
      success: true,
      message: `Student verification ${status} successfully.`,
      student,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all vehicles
// @route   GET /api/admin/vehicles
// @access  Private (Admin only)
exports.getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find()
      .populate('owner_id', 'name student_id phone email verification_status')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: vehicles.length, vehicles });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify or reject vehicle
// @route   PUT /api/admin/vehicles/:id/verify
// @access  Private (Admin only)
exports.verifyVehicle = async (req, res, next) => {
  try {
    const { verification_status } = req.body; // 'verified' or 'rejected'
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { verification_status },
      { new: true }
    ).populate('owner_id', 'name');

    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    await logAudit(req, 'VEHICLE_VERIFIED', 'Vehicle', vehicle._id, { verification_status });

    res.status(200).json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all rides
// @route   GET /api/admin/rides
// @access  Private (Admin only)
exports.getRides = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.ride_status = status;

    const rides = await Ride.find(query)
      .populate('driver_id', 'name email phone student_id verification_status')
      .populate('vehicle_id')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: rides.length, rides });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin only)
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('passenger_id', 'name student_id phone')
      .populate('driver_id', 'name student_id phone')
      .populate('ride_id', 'source destination journey_date departure_time cost_per_seat')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

// @desc    Get complaints and reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporter_id', 'name student_id phone')
      .populate('reported_user_id', 'name student_id phone is_blocked')
      .populate('ride_id', 'destination journey_date')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (err) {
    next(err);
  }
};

// @desc    Update report status and take action
// @route   PUT /api/admin/reports/:id/status
// @access  Private (Admin only)
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { status, action_taken, admin_notes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    report.status = status || report.status;
    report.action_taken = action_taken || report.action_taken;
    report.admin_notes = admin_notes || report.admin_notes;
    report.resolved_by = req.user._id;
    report.resolved_at = Date.now();
    await report.save();

    await logAudit(req, 'REPORT_RESOLVED', 'Report', report._id, { status, action_taken });

    res.status(200).json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

// @desc    Suspend or unblock user account
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin only)
exports.toggleUserBlock = async (req, res, next) => {
  try {
    const { is_blocked, block_reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.is_blocked = is_blocked;
    user.block_reason = is_blocked ? block_reason || 'Administrative safety suspension' : null;
    await user.save();

    await logAudit(req, is_blocked ? 'USER_SUSPENDED' : 'USER_UNBLOCKED', 'User', user._id, { block_reason });

    res.status(200).json({
      success: true,
      message: `User account ${is_blocked ? 'suspended' : 're-activated'}.`,
      user: user.getPublicProfile(true),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reviews and manage moderation
// @route   GET /api/admin/reviews
// @access  Private (Admin only)
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('passenger_id', 'name student_id')
      .populate('driver_id', 'name student_id')
      .populate('ride_id', 'destination journey_date')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
};

// @desc    Moderate review (hide/unhide)
// @route   PUT /api/admin/reviews/:id/moderate
// @access  Private (Admin only)
exports.moderateReview = async (req, res, next) => {
  try {
    const { is_hidden } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, { is_hidden }, { new: true });

    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    await logAudit(req, is_hidden ? 'REVIEW_HIDDEN' : 'REVIEW_UNHIDDEN', 'Review', review._id);

    res.status(200).json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

// @desc    Get system security audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin only)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('user_id', 'name email student_id role')
      .sort({ created_at: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
};
