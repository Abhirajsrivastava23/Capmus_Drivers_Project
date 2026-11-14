const mongoose = require('mongoose');

const driverDocumentSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    license_number: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    license_expiry: {
      type: Date,
      default: null,
    },
    license_front_image: {
      type: String,
      required: true,
    },
    license_back_image: {
      type: String,
      default: '',
    },
    driving_experience_years: {
      type: Number,
      default: 2,
    },
    verification_status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DriverDocument', driverDocumentSchema);
