const express = require('express');
const router = express.Router();
const {
  createBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  getMyBookings,
  getRideBookings,
  updatePaymentStatus,
} = require('../controllers/bookingController');
const { protect, requireVerifiedStudent } = require('../middleware/auth');

router.post('/', protect, requireVerifiedStudent, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/ride/:rideId', protect, getRideBookings);

router.put('/:id/accept', protect, acceptBooking);
router.put('/:id/reject', protect, rejectBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/payment', protect, updatePaymentStatus);

module.exports = router;
