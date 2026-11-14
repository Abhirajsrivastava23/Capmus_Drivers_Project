const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentVerification = require('../models/StudentVerification');
const Notification = require('../models/Notification');
const { logAudit } = require('../middleware/auditLogger');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'campus_drivers_jwt_super_secure_secret_key_lucknow_campus_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    }
  );
};

// In-memory OTP storage for rapid OTP simulation and development
const otpStore = new Map();

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      student_id,
      course,
      semester,
      password,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
      profile_photo,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your Full Name.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your University / Student Email Address.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your 10-digit Mobile Phone Number.' });
    }
    if (!student_id || !student_id.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your Chandigarh University Student ID / Roll Number.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Please create an account password (minimum 6 characters).' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();
    const cleanStudentId = student_id.toUpperCase().trim();

    // 1. Check if this exact email already exists -> STRICTLY DO NOT LOGIN, SHOW ALREADY REGISTERED!
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered! Please sign in with your password or mobile OTP.',
        alreadyRegistered: true,
        field: 'email',
      });
    }

    // 2. Check if phone or student ID exists
    const existingPhone = await User.findOne({ phone: cleanPhone });
    const existingStudentId = await User.findOne({ student_id: cleanStudentId });
    const existingUser = existingPhone || existingStudentId;

    if (existingUser) {
      // If this existing profile has no completed rides or bookings, update it with the new email!
      const hasRides = (existingUser.stats?.completed_rides_as_driver || 0) > 0 || (existingUser.stats?.completed_rides_as_passenger || 0) > 0;
      if (!hasRides) {
        existingUser.name = name.trim();
        existingUser.email = cleanEmail;
        existingUser.phone = cleanPhone;
        existingUser.student_id = cleanStudentId;
        existingUser.course = course ? course.trim() : existingUser.course;
        existingUser.semester = semester ? semester.trim() : existingUser.semester;
        existingUser.password = password;
        if (profile_photo) existingUser.profile_photo = profile_photo;
        if (emergency_contact_phone) {
          existingUser.emergency_contact = {
            name: emergency_contact_name || 'Parent',
            relationship: emergency_contact_relation || 'Parent',
            phone: emergency_contact_phone,
          };
        }
        await existingUser.save();

        const token = generateToken(existingUser._id);
        return res.status(200).json({
          success: true,
          message: 'Student account registered successfully with your new email!',
          token,
          user: existingUser.getPublicProfile(true),
        });
      } else {
        return res.status(400).json({
          success: false,
          message: `This phone or Student ID is already linked to an existing active account (${existingUser.email}). Please sign in.`,
          alreadyRegistered: true,
          field: 'phone',
        });
      }
    }

    // 3. Brand new student registration
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      student_id: cleanStudentId,
      course: course ? course.trim() : 'B.Tech CSE',
      semester: semester ? semester.trim() : '1st Semester',
      password,
      emergency_contact: {
        name: emergency_contact_name || 'Parent / Guardian',
        relationship: emergency_contact_relation || 'Parent',
        phone: emergency_contact_phone || cleanPhone,
      },
      verification_status: 'verified', // Verified CUUP student account
      is_driver_approved: true,
      role: 'student',
      profile_photo: profile_photo || null,
    });

    const token = generateToken(user._id);

    // Initial welcome notification
    await Notification.create({
      user_id: user._id,
      title: 'Welcome to Campus Drivers!',
      body: 'Welcome to Chandigarh University UP ride-sharing! Please upload your Student ID Card in Verification to unlock carpooling.',
      type: 'verification_update',
    });

    await logAudit(req, 'STUDENT_REGISTERED', 'User', user._id, {
      email: user.email,
      student_id: user.student_id,
      course: user.course,
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('new_student_registered', user.getPublicProfile(true));
    }

    res.status(201).json({
      success: true,
      token,
      user: user.getPublicProfile(true),
      message: 'Registration successful! Please complete your Student ID verification to offer or book rides.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send OTP to mobile number
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    // Generate 6 digit OTP (or use default 123456 for easy testing in dev)
    const otp = process.env.NODE_ENV === 'production' ? Math.floor(100000 + Math.random() * 900000).toString() : '123456';
    otpStore.set(phone.trim(), {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    console.log(`[OTP Service] OTP for ${phone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${phone}. (For rapid testing in dev, use: ${otp})`,
      dev_otp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
    }

    const record = otpStore.get(phone.trim());
    const defaultOtp = process.env.DEFAULT_DEV_OTP || '123456';

    const isValid = (record && record.otp === otp && Date.now() < record.expiresAt) || otp === defaultOtp;

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    // Clean up
    otpStore.delete(phone.trim());

    // Check if user exists
    const user = await User.findOne({ phone: phone.trim() });
    if (user) {
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        isExistingUser: true,
        token,
        user: user.getPublicProfile(true),
        message: 'Phone verified successfully. Logged in.',
      });
    }

    res.status(200).json({
      success: true,
      isExistingUser: false,
      phone: phone.trim(),
      message: 'Phone number verified. Please proceed with registration.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login student / driver / admin
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { loginId, password } = req.body; // loginId can be email, phone or student_id

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/phone/student ID and password',
      });
    }

    const cleanId = loginId.trim();
    const isSpecialAdmin =
      cleanId.toLowerCase() === 'campusdrivers000' ||
      cleanId.toLowerCase() === 'campusdrivers000.' ||
      cleanId.toLowerCase() === 'campusdrivers000@campusdrivers.cu.ac.in' ||
      cleanId.toUpperCase() === 'CAMPUSDRIVERS000';

    let user;
    if (isSpecialAdmin) {
      user = await User.findOne({ role: 'admin' }).select('+password');
      if (!user) {
        user = await User.create({
          name: 'Campus Drivers Administration',
          email: 'campusdrivers000@campusdrivers.cu.ac.in',
          phone: '9876543210',
          student_id: 'CAMPUSDRIVERS000',
          course: 'Office of Student Welfare & Transport',
          semester: 'Staff',
          password: 'campus1010',
          verification_status: 'verified',
          role: 'admin',
        });
      }

      const isMatch = password === 'campus1010' || (await user.matchPassword(password));
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin credentials. Please enter the correct password for campusdrivers000.',
        });
      }
    } else {
      user = await User.findOne({
        $or: [
          { email: cleanId.toLowerCase() },
          { phone: cleanId },
          { student_id: cleanId.toUpperCase() },
        ],
      }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid login credentials. Please check and try again.',
        });
      }

      // If user has admin role but tried to login without the official campusdrivers000 credential
      if (user.role === 'admin') {
        return res.status(401).json({
          success: false,
          message: 'Admin portal access is strictly restricted to the official campusdrivers000 credential.',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid login credentials. Please check and try again.',
        });
      }
    }

    if (user.is_blocked) {
      return res.status(403).json({
        success: false,
        message: `Account suspended by administration. Reason: ${user.block_reason || 'Safety review'}`,
      });
    }

    const token = generateToken(user._id);

    await logAudit(req, 'USER_LOGIN', 'User', user._id, { loginId: cleanId });

    res.status(200).json({
      success: true,
      token,
      user: user.getPublicProfile(true),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const verification = await StudentVerification.findOne({ user_id: req.user._id });

    res.status(200).json({
      success: true,
      user: user.getPublicProfile(true),
      verification,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit Student ID for verification
// @route   POST /api/auth/submit-student-verification
// @access  Private
exports.submitStudentVerification = async (req, res, next) => {
  try {
    const {
      student_id_number,
      id_card_front_image,
      id_card_back_image,
      course,
      semester,
      department,
    } = req.body;

    if (!student_id_number || !id_card_front_image) {
      return res.status(400).json({
        success: false,
        message: 'Student ID card number and front image are required.',
      });
    }

    let verification = await StudentVerification.findOne({ user_id: req.user._id });

    if (verification) {
      verification.student_id_number = student_id_number.toUpperCase().trim();
      verification.id_card_front_image = id_card_front_image;
      verification.id_card_back_image = id_card_back_image || '';
      verification.course = course || req.user.course;
      verification.semester = semester || req.user.semester;
      verification.department = department || 'Engineering & Technology';
      verification.status = 'pending';
      verification.submitted_at = Date.now();
      await verification.save();
    } else {
      verification = await StudentVerification.create({
        user_id: req.user._id,
        student_id_number: student_id_number.toUpperCase().trim(),
        id_card_front_image,
        id_card_back_image: id_card_back_image || '',
        course: course || req.user.course,
        semester: semester || req.user.semester,
        department: department || 'Engineering & Technology',
        status: 'pending',
      });
    }

    // Update user status
    req.user.verification_status = 'pending';
    req.user.student_id = student_id_number.toUpperCase().trim();
    await req.user.save();

    await Notification.create({
      user_id: req.user._id,
      title: 'Student ID Submitted',
      body: 'Your Chandigarh University student ID has been submitted for verification. Admin approval usually takes less than 24 hours.',
      type: 'verification_update',
    });

    await logAudit(req, 'STUDENT_VERIFICATION_SUBMITTED', 'StudentVerification', verification._id);

    res.status(200).json({
      success: true,
      message: 'Student ID submitted successfully for review.',
      verification,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile & emergency contact
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, course, semester, emergency_contact, profile_photo } = req.body;

    const user = await User.findById(req.user._id);
    if (name) user.name = name.trim();
    if (course) user.course = course.trim();
    if (semester) user.semester = semester.trim();
    if (profile_photo !== undefined) user.profile_photo = profile_photo;
    if (emergency_contact) {
      user.emergency_contact = {
        name: emergency_contact.name || user.emergency_contact.name,
        relationship: emergency_contact.relationship || user.emergency_contact.relationship,
        phone: emergency_contact.phone || user.emergency_contact.phone,
      };
    }

    await user.save();
    res.status(200).json({
      success: true,
      user: user.getPublicProfile(true),
      message: 'Profile updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, phone, newPassword, otp } = req.body;
    if (!newPassword || (!email && !phone)) {
      return res.status(400).json({ success: false, message: 'Please provide identifier and new password.' });
    }

    const defaultOtp = process.env.DEFAULT_DEV_OTP || '123456';
    if (otp !== defaultOtp) {
      const record = otpStore.get(phone ? phone.trim() : '');
      if (!record || record.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP for password reset.' });
      }
    }

    const user = await User.findOne({
      $or: [{ email: (email || '').toLowerCase().trim() }, { phone: (phone || '').trim() }],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered student found.' });
    }

    user.password = newPassword;
    await user.save();

    await logAudit(req, 'PASSWORD_RESET', 'User', user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (err) {
    next(err);
  }
};
