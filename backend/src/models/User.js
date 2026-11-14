const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide student email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      unique: true,
      trim: true,
    },
    student_id: {
      type: String,
      required: [true, 'Please provide Chandigarh University Student ID'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    course: {
      type: String,
      required: [true, 'Please provide course (e.g., B.Tech CSE)'],
      trim: true,
    },
    semester: {
      type: String,
      required: [true, 'Please provide semester'],
      trim: true,
    },
    profile_photo: {
      type: String,
      default: null, // Note: Profile photo is optional and not primary as per specifications
    },
    verification_status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    role: {
      type: String,
      enum: ['student', 'driver', 'admin'],
      default: 'student',
    },
    is_driver_approved: {
      type: Boolean,
      default: false,
    },
    emergency_contact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: 'Parent' },
      phone: { type: String, default: '' },
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
      select: false,
    },
    stats: {
      completed_rides_as_driver: { type: Number, default: 0 },
      completed_rides_as_passenger: { type: Number, default: 0 },
      total_reviews: { type: Number, default: 0 },
      average_rating: { type: Number, default: 5.0 },
      safety_score: { type: Number, default: 5.0 },
      punctuality_score: { type: Number, default: 5.0 },
      behaviour_score: { type: Number, default: 5.0 },
      communication_score: { type: Number, default: 5.0 },
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
    block_reason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Mask phone for public views
userSchema.methods.getPublicProfile = function (isAuthorized = false) {
  const user = this.toObject();
  delete user.password;
  if (!isAuthorized) {
    user.phone = user.phone ? `${user.phone.slice(0, 3)}****${user.phone.slice(-3)}` : '';
  }
  return user;
};

module.exports = mongoose.model('User', userSchema);
