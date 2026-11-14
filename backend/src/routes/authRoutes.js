const express = require('express');
const router = express.Router();
const {
  register,
  login,
  sendOtp,
  verifyOtp,
  getMe,
  updateProfile,
  submitStudentVerification,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/send-otp', authLimiter, sendOtp);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/reset-password', authLimiter, resetPassword);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/submit-student-verification', protect, submitStudentVerification);

module.exports = router;
