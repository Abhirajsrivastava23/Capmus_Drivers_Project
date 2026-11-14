const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    source: {
      type: String,
      required: [true, 'Starting location is required'],
      default: 'Chandigarh University UP Campus, Lucknow',
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination city is required'],
      trim: true,
      index: true,
    },
    pickup_location: {
      type: String,
      required: [true, 'Pickup location is required'],
      trim: true,
    },
    drop_location: {
      type: String,
      required: [true, 'Drop location is required'],
      trim: true,
    },
    journey_date: {
      type: String, // e.g. "2026-11-20" or Date format for easy string and date matching
      required: [true, 'Journey date is required'],
      index: true,
    },
    departure_time: {
      type: String,
      required: [true, 'Exact departure time is required (e.g., 07:30 AM)'],
      trim: true,
    },
    expected_arrival: {
      type: String,
      default: '',
      trim: true,
    },
    total_seats: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    available_seats: {
      type: Number,
      required: true,
      min: 0,
    },
    booked_seats: {
      type: Number,
      default: 0,
    },
    cost_per_seat: {
      type: Number,
      required: [true, 'Per-seat fuel cost contribution is required'],
      min: 0,
    },
    ac_available: {
      type: Boolean,
      default: true,
    },
    luggage_capacity: {
      type: String,
      enum: ['Light / Backpacks only', 'Medium Luggage', 'Large Suitcases'],
      default: 'Medium Luggage',
    },
    instructions: {
      type: String,
      default: '',
      trim: true,
    },
    ride_status: {
      type: String,
      enum: ['published', 'started', 'completed', 'cancelled'],
      default: 'published',
      index: true,
    },
    cancellation_reason: {
      type: String,
      default: null,
    },
    started_at: {
      type: Date,
      default: null,
    },
    completed_at: {
      type: Date,
      default: null,
    },
    // Tracking trip sharing token
    share_token: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for lightning fast searches
rideSchema.index({ destination: 1, journey_date: 1, ride_status: 1 });

module.exports = mongoose.model('Ride', rideSchema);
