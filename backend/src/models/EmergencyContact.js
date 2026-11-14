const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    relationship: {
      type: String,
      required: true,
      enum: ['Father', 'Mother', 'Guardian', 'Sibling', 'Friend', 'Campus Warden', 'Other'],
      default: 'Parent',
    },
    phone_number: {
      type: String,
      required: true,
      trim: true,
    },
    is_primary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
