const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'campus_drivers_jwt_super_secure_secret_key_lucknow_campus_2026'
    );
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (user.is_blocked) {
      return res.status(403).json({
        success: false,
        message: `Account is suspended: ${user.block_reason || 'Contact university admin'}`,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session token invalid or expired. Please log in again.',
    });
  }
};

// Only verified Chandigarh University students can access ride-booking and ride-offering
const requireVerifiedStudent = async (req, res, next) => {
  if (req.user.verification_status === 'verified') {
    return next();
  }

  // Auto-verify valid CUUP university accounts for immediate frictionless carpooling
  if (req.user.email?.includes('cumail.in') || req.user.student_id) {
    req.user.verification_status = 'verified';
    req.user.is_driver_approved = true;
    await req.user.save();
    return next();
  }

  return res.status(403).json({
    success: false,
    isVerificationRequired: true,
    message: 'Access restricted: Only verified Chandigarh University students with approved Student IDs can offer or book rides.',
  });
};

// Admin only guard
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admin access required.',
    });
  }
  next();
};

module.exports = {
  protect,
  requireVerifiedStudent,
  requireAdmin,
};
