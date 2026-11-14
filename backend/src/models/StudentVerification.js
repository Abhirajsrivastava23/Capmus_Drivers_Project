const mongoose = require('mongoose');

const studentVerificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    student_id_number: {
      type: String,
      required: true,
      trim: true,
    },
    id_card_front_image: {
      type: String,
      required: true,
    },
    id_card_back_image: {
      type: String,
      default: '',
    },
    course: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: 'Engineering & Technology',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    review_notes: {
      type: String,
      default: '',
    },
    submitted_at: {
      type: Date,
      default: Date.now,
    },
    reviewed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudentVerification', studentVerificationSchema);
