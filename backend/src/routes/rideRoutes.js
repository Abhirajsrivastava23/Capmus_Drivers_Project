const express = require('express');
const router = express.Router();
const {
  offerRide,
  searchRides,
  getPopularRoutes,
  getRideById,
  updateRide,
  startRide,
  completeRide,
  cancelRide,
  getMyPublishedRides,
  broadcastRideRequest,
  getActiveRideRequests,
  acceptRideRequest,
} = require('../controllers/rideController');
const { protect, requireVerifiedStudent } = require('../middleware/auth');
const { rideOfferLimiter } = require('../middleware/rateLimiter');

// Public search & broadcast endpoints
router.get('/search', searchRides);
router.get('/popular', getPopularRoutes);

// Broadcast ride request endpoints (Notify all registered drivers)
router.post('/broadcast-request', (req, res, next) => {
  if (req.headers.authorization) return protect(req, res, next);
  next();
}, broadcastRideRequest);

router.get('/broadcast-requests', getActiveRideRequests);

router.post('/broadcast-requests/:id/accept', (req, res, next) => {
  if (req.headers.authorization) return protect(req, res, next);
  next();
}, acceptRideRequest);

// Driver endpoints (Requires verified Chandigarh University student status)
router.post('/', protect, requireVerifiedStudent, rideOfferLimiter, offerRide);
router.get('/driver/my-rides', protect, getMyPublishedRides);
router.put('/:id', protect, updateRide);
router.put('/:id/start', protect, startRide);
router.put('/:id/complete', protect, completeRide);
router.put('/:id/cancel', protect, cancelRide);

// Single ride details (optional auth to reveal phone if booking confirmed)
router.get('/:id', (req, res, next) => {
  // Try protect middleware if authorization header exists, otherwise proceed
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, getRideById);

module.exports = router;
