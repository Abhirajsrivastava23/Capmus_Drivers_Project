const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Review = require('../models/Review');
const Ride = require('../models/Ride');

// @desc    Get driver public profile prioritizing car details, verification, and rating
// @route   GET /api/users/:id/driver-profile
// @access  Public / Private
exports.getDriverProfile = async (req, res, next) => {
  try {
    const driver = await User.findById(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    // Fetch driver's primary registered vehicle
    const vehicle = await Vehicle.findOne({ owner_id: driver._id, is_active: true });

    // Fetch verified reviews
    const reviews = await Review.find({ driver_id: driver._id, is_hidden: false })
      .populate('passenger_id', 'name course semester')
      .populate('ride_id', 'destination journey_date')
      .sort({ createdAt: -1 });

    // Completed rides count
    const completedRidesCount = await Ride.countDocuments({
      driver_id: driver._id,
      ride_status: 'completed',
    });

    const profileData = {
      _id: driver._id,
      name: driver.name,
      student_id: driver.student_id,
      course: driver.course,
      semester: driver.semester,
      is_verified_student: driver.verification_status === 'verified',
      role: driver.role,
      stats: {
        total_completed_rides: completedRidesCount || driver.stats?.completed_rides_as_driver || 0,
        average_rating: driver.stats?.average_rating || 5.0,
        total_reviews: reviews.length,
        safety_score: driver.stats?.safety_score || 5.0,
        punctuality_score: driver.stats?.punctuality_score || 5.0,
        behaviour_score: driver.stats?.behaviour_score || 5.0,
        communication_score: driver.stats?.communication_score || 5.0,
      },
      primary_vehicle: vehicle
        ? {
            model: vehicle.vehicle_model,
            registration_number: vehicle.registration_number,
            colour: vehicle.colour,
            vehicle_type: vehicle.vehicle_type,
            ac_available: vehicle.ac_available,
            luggage_capacity: vehicle.luggage_capacity,
            verification_status: vehicle.verification_status,
          }
        : null,
      reviews,
    };

    res.status(200).json({
      success: true,
      profile: profileData,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register or update user vehicle
// @route   POST /api/users/vehicle
// @access  Private
exports.registerVehicle = async (req, res, next) => {
  try {
    const { vehicle_model, registration_number, colour, vehicle_type, ac_available, luggage_capacity } = req.body;

    if (!vehicle_model || !registration_number || !colour) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle model, registration number (UP32...), and colour are required.',
      });
    }

    const cleanReg = registration_number.toUpperCase().trim();
    let vehicle = await Vehicle.findOne({ registration_number: cleanReg });

    if (vehicle) {
      if (vehicle.owner_id.toString() !== req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'This registration number is already registered to another student account.',
        });
      }
      vehicle.vehicle_model = vehicle_model.trim();
      vehicle.colour = colour.trim();
      vehicle.vehicle_type = vehicle_type || 'Hatchback';
      vehicle.ac_available = ac_available !== undefined ? ac_available : true;
      vehicle.luggage_capacity = luggage_capacity || 'Medium Luggage';
      await vehicle.save();
    } else {
      vehicle = await Vehicle.create({
        owner_id: req.user._id,
        vehicle_model: vehicle_model.trim(),
        registration_number: cleanReg,
        colour: colour.trim(),
        vehicle_type: vehicle_type || 'Hatchback',
        ac_available: ac_available !== undefined ? ac_available : true,
        luggage_capacity: luggage_capacity || 'Medium Luggage',
        verification_status: 'verified',
      });
    }

    // Mark user as having driver capabilities
    req.user.role = 'driver';
    req.user.is_driver_approved = true;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Vehicle registered successfully. You can now publish rides!',
      vehicle,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's registered vehicles
// @route   GET /api/users/vehicle/my-vehicles
// @access  Private
exports.getMyVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ owner_id: req.user._id, is_active: true });
    res.status(200).json({ success: true, count: vehicles.length, vehicles });
  } catch (err) {
    next(err);
  }
};
