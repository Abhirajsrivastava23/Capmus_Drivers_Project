const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'booking_request',
        'booking_accepted',
        'booking_rejected',
        'booking_confirmed',
        'ride_started',
        'ride_completed',
        'ride_cancelled',
        'departure_time_changed',
        'sos_alert',
        'verification_update',
        'ride_broadcast',
        'system',
      ],
      required: true,
    },
    data: {
      type: Object,
      default: {},
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
