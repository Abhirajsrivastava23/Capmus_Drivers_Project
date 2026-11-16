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

// Limiter for authentication & OTP endpoints to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 500,
  message: {
    success: false,
    message: 'Too many login or OTP attempts. Please wait a few minutes before retrying.',
  },
  skip: () => process.env.NODE_ENV === 'test',
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
