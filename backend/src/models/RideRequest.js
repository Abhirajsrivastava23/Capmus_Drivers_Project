const mongoose = require('mongoose');

const rideRequestSchema = new mongoose.Schema(
  {
    passenger_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    passenger_name: {
      type: String,
      default: 'Ananya Gupta',
    },
    passenger_phone: {
      type: String,
      default: '9876500002',
    },
    passenger_course: {
      type: String,
      default: 'B.Tech CSE - 4th Sem',
    },
    source: {
      type: String,
      default: 'Chandigarh University UP Campus, Lucknow',
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    seats: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled'],
      default: 'pending',
    },
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    driver_name: {
      type: String,
      default: null,
    },
    driver_phone: {
      type: String,
      default: null,
    },
    vehicle_info: {
      type: String,
      default: null,
    },
    estimated_contribution: {
      type: Number,
      default: 150,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RideRequest', rideRequestSchema);

