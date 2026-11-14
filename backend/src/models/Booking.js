const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    ride_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
      index: true,
    },
    passenger_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    seats_booked: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    total_cost: {
      type: Number,
      required: true,
      min: 0,
    },
    booking_status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
    payment_status: {
      type: String,
      enum: ['unpaid', 'cash_declared', 'upi_declared', 'paid'],
      default: 'unpaid',
    },
    payment_reference: {
      type: String,
      default: null,
    },
    pickup_note: {
      type: String,
      default: '',
    },
    booking_date: {
      type: Date,
      default: Date.now,
    },
    cancellation_reason: {
      type: String,
      default: null,
    },
    cancelled_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    has_reviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ ride_id: 1, passenger_id: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
