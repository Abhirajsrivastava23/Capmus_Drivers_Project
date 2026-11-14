const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    ride_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
      index: true,
    },
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // Strictly prevents duplicate reviews for the same booking
    },
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    passenger_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    safety_rating: {
      type: Number,
      required: [true, 'Safety rating is required (1-5)'],
      min: 1,
      max: 5,
    },
    behaviour_rating: {
      type: Number,
      required: [true, 'Behaviour rating is required (1-5)'],
      min: 1,
      max: 5,
    },
    punctuality_rating: {
      type: Number,
      required: [true, 'Punctuality rating is required (1-5)'],
      min: 1,
      max: 5,
    },
    communication_rating: {
      type: Number,
      required: [true, 'Communication rating is required (1-5)'],
      min: 1,
      max: 5,
    },
    overall_rating: {
      type: Number,
      required: [true, 'Overall rating is required (1-5)'],
      min: 1,
      max: 5,
    },
    review_text: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    is_reported: {
      type: Boolean,
      default: false,
    },
    report_reason: {
      type: String,
      default: null,
    },
    is_hidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Review', reviewSchema);
