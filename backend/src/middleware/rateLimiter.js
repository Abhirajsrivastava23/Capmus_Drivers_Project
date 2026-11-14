const rateLimit = require('express-rate-limit');

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication & OTP endpoints to prevent brute force
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many login or OTP attempts. Please wait 10 minutes before retrying.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Ride creation limiter to avoid spam
const rideOfferLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    success: false,
    message: 'You have published several rides recently. Please wait a short while before offering more rides.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  rideOfferLimiter,
};
