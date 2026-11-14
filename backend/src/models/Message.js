const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    ride_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
      index: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    sent_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ ride_id: 1, sent_at: 1 });

module.exports = mongoose.model('Message', messageSchema);
