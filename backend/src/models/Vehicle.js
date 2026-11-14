const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle_model: {
      type: String,
      required: [true, 'Vehicle model is required (e.g., Hyundai i10, Maruti Swift)'],
      trim: true,
    },
    registration_number: {
      type: String,
      required: [true, 'Registration number is required (e.g., UP32 AB 1234)'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    colour: {
      type: String,
      required: [true, 'Vehicle colour is required'],
      trim: true,
    },
    vehicle_type: {
      type: String,
      enum: ['Hatchback', 'Sedan', 'SUV', 'Compact SUV'],
      default: 'Hatchback',
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
    rc_number: {
      type: String,
      default: '',
    },
    rc_image: {
      type: String,
      default: '',
    },
    insurance_valid_until: {
      type: Date,
      default: null,
    },
    verification_status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
