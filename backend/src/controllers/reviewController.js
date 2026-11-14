const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const User = require('../models/User');
const { logAudit } = require('../middleware/auditLogger');

// @desc    Submit 5-star driving experience review
// @route   POST /api/reviews
// @access  Private (Passenger with confirmed & completed booking)
exports.submitReview = async (req, res, next) => {
  try {
    const {
      booking_id,
      safety_rating,
      behaviour_rating,
      punctuality_rating,
      communication_rating,
      overall_rating,
      review_text,
    } = req.body;

    if (!booking_id) {
      return res.status(400).json({ success: false, message: 'Booking ID is required.' });
    }

    const booking = await Booking.findById(booking_id).populate('ride_id');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Only passenger who booked can review
    if (booking.passenger_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Only the passenger of this booking can review.' });
    }

    // Only completed bookings can review
    if (booking.booking_status !== 'completed' && booking.ride_id.ride_status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review a driver after the ride has been completed.',
      });
    }

    // Prevent duplicate reviews
    const existingReview = await Review.findOne({ booking_id: booking._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this journey.',
      });
    }

    // Validate 1-5 ratings
    const ratings = [safety_rating, behaviour_rating, punctuality_rating, communication_rating, overall_rating];
    for (const r of ratings) {
      if (r === undefined || r < 1 || r > 5) {
        return res.status(400).json({
          success: false,
          message: 'All 5 rating categories (Safety, Behaviour, Punctuality, Communication, Overall) must be between 1 and 5 stars.',
        });
      }
    }

    const review = await Review.create({
      ride_id: booking.ride_id._id,
      booking_id: booking._id,
      driver_id: booking.driver_id,
      passenger_id: req.user._id,
      safety_rating: Number(safety_rating),
      behaviour_rating: Number(behaviour_rating),
      punctuality_rating: Number(punctuality_rating),
      communication_rating: Number(communication_rating),
      overall_rating: Number(overall_rating),
      review_text: review_text ? review_text.trim() : '',
    });

    booking.has_reviewed = true;
    await booking.save();

    // Recalculate driver aggregate ratings and sub-scores
    const driverReviews = await Review.find({ driver_id: booking.driver_id, is_hidden: false });
    const count = driverReviews.length;

    const avgOverall = (driverReviews.reduce((sum, r) => sum + r.overall_rating, 0) / count).toFixed(1);
    const avgSafety = (driverReviews.reduce((sum, r) => sum + r.safety_rating, 0) / count).toFixed(1);
    const avgPunctuality = (driverReviews.reduce((sum, r) => sum + r.punctuality_rating, 0) / count).toFixed(1);
    const avgBehaviour = (driverReviews.reduce((sum, r) => sum + r.behaviour_rating, 0) / count).toFixed(1);
    const avgCommunication = (driverReviews.reduce((sum, r) => sum + r.communication_rating, 0) / count).toFixed(1);

    await User.findByIdAndUpdate(booking.driver_id, {
      $set: {
        'stats.total_reviews': count,
        'stats.average_rating': Number(avgOverall),
        'stats.safety_score': Number(avgSafety),
        'stats.punctuality_score': Number(avgPunctuality),
        'stats.behaviour_score': Number(avgBehaviour),
        'stats.communication_score': Number(avgCommunication),
      },
    });

    await logAudit(req, 'REVIEW_SUBMITTED', 'Review', review._id, {
      driver_id: booking.driver_id,
      overall_rating,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your driving experience review has been submitted.',
      review,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get driver reviews & 5-star rating breakdown
// @route   GET /api/reviews/driver/:driverId
// @access  Public
exports.getDriverReviews = async (req, res, next) => {
  try {
    const driver = await User.findById(req.params.driverId);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const reviews = await Review.find({ driver_id: driver._id, is_hidden: false })
      .populate('passenger_id', 'name course semester verification_status')
      .populate('ride_id', 'source destination journey_date')
      .sort({ createdAt: -1 });

    const total = reviews.length;

    // Calculate rating distributions (1 to 5 stars)
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.round(r.overall_rating);
      if (distribution[star] !== undefined) distribution[star]++;
    });

    const breakdown = {
      overall: driver.stats?.average_rating || 5.0,
      safety: driver.stats?.safety_score || 5.0,
      punctuality: driver.stats?.punctuality_score || 5.0,
      behaviour: driver.stats?.behaviour_score || 5.0,
      communication: driver.stats?.communication_score || 5.0,
      total_reviews: total,
      completed_rides: driver.stats?.completed_rides_as_driver || 0,
      distribution,
    };

    res.status(200).json({
      success: true,
      breakdown,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Report abusive or fake review
// @route   POST /api/reviews/:id/report
// @access  Private
exports.reportReview = async (req, res, next) => {
  try {
    const { report_reason } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    review.is_reported = true;
    review.report_reason = report_reason || 'Reported by user as abusive/fake';
    await review.save();

    await logAudit(req, 'REVIEW_REPORTED', 'Review', review._id, { reason: report_reason });

    res.status(200).json({
      success: true,
      message: 'Review reported to administration for verification.',
      review,
    });
  } catch (err) {
    next(err);
  }
};
