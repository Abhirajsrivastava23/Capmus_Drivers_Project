const express = require('express');
const router = express.Router();
const {
  submitReview,
  getDriverReviews,
  reportReview,
} = require('../controllers/reviewController');
const { protect, requireVerifiedStudent } = require('../middleware/auth');

router.post('/', protect, requireVerifiedStudent, submitReview);
router.get('/driver/:driverId', getDriverReviews);
router.post('/:id/report', protect, reportReview);

module.exports = router;
