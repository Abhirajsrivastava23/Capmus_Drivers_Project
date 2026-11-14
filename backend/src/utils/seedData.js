const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');

dotenv.config();

const User = require('../models/User');
const StudentVerification = require('../models/StudentVerification');
const Vehicle = require('../models/Vehicle');
const DriverDocument = require('../models/DriverDocument');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const EmergencyContact = require('../models/EmergencyContact');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing records for clean setup...');
    await Promise.all([
      User.deleteMany({}),
      StudentVerification.deleteMany({}),
      Vehicle.deleteMany({}),
      DriverDocument.deleteMany({}),
      Ride.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
      EmergencyContact.deleteMany({}),
      Report.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[Seed] Creating Admin and Student accounts...');

    // 1. Admin
    const admin = await User.create({
      name: 'Chandigarh University Admin',
      email: 'admin@campusdrivers.cu.ac.in',
      phone: '9876543210',
      student_id: 'CUUP-ADMIN-01',
      course: 'Office of Student Welfare & Transport',
      semester: 'Staff',
      password: 'Password@123',
      verification_status: 'verified',
      role: 'admin',
      emergency_contact: {
        name: 'Campus Proctor Office',
        relationship: 'Other',
        phone: '+915226688000',
      },
    });

    // 2. Driver 1 - Ananya Sharma
    const driverAarav = await User.create({
      name: 'Ananya Sharma',
      email: 'aarav.sharma@cumail.in',
      phone: '9876500001',
      student_id: 'CUUP2024CS0142',
      course: 'B.Tech Computer Science & Engineering',
      semester: '6th Semester',
      password: 'Password@123',
      verification_status: 'verified',
      role: 'driver',
      is_driver_approved: true,
      emergency_contact: {
        name: 'Rajesh Sharma',
        relationship: 'Father',
        phone: '9876599001',
      },
      stats: {
        completed_rides_as_driver: 14,
        completed_rides_as_passenger: 3,
        total_reviews: 8,
        average_rating: 4.9,
        safety_score: 5.0,
        punctuality_score: 4.8,
        behaviour_score: 5.0,
        communication_score: 4.9,
      },
    });

    // 3. Driver 2 - Priya Verma
    const driverPriya = await User.create({
      name: 'Priya Verma',
      email: 'priya.verma@cumail.in',
      phone: '9876500002',
      student_id: 'CUUP2023MBA0088',
      course: 'MBA Business Analytics',
      semester: '4th Semester',
      password: 'Password@123',
      verification_status: 'verified',
      role: 'driver',
      is_driver_approved: true,
      emergency_contact: {
        name: 'Sunita Verma',
        relationship: 'Mother',
        phone: '9876599002',
      },
      stats: {
        completed_rides_as_driver: 9,
        completed_rides_as_passenger: 2,
        total_reviews: 6,
        average_rating: 4.8,
        safety_score: 4.9,
        punctuality_score: 4.7,
        behaviour_score: 5.0,
        communication_score: 4.8,
      },
    });

    // 4. Driver 3 - Rohan Tripathi
    const driverRohan = await User.create({
      name: 'Rohan Tripathi',
      email: 'rohan.tripathi@cumail.in',
      phone: '9876500003',
      student_id: 'CUUP2024ME0055',
      course: 'B.Tech Mechanical Engineering',
      semester: '4th Semester',
      password: 'Password@123',
      verification_status: 'verified',
      role: 'driver',
      is_driver_approved: true,
      emergency_contact: {
        name: 'V.K. Tripathi',
        relationship: 'Father',
        phone: '9876599003',
      },
      stats: {
        completed_rides_as_driver: 22,
        completed_rides_as_passenger: 5,
        total_reviews: 15,
        average_rating: 5.0,
        safety_score: 5.0,
        punctuality_score: 4.9,
        behaviour_score: 5.0,
        communication_score: 5.0,
      },
    });

    // 5. Passenger 1 - Ananya Gupta
    const passengerAnanya = await User.create({
      name: 'Ananya Gupta',
      email: 'ananya.gupta@cumail.in',
      phone: '9876500004',
      student_id: 'CUUP2024BCA0110',
      course: 'BCA Cloud & DevOps',
      semester: '4th Semester',
      password: 'Password@123',
      verification_status: 'verified',
      role: 'student',
      emergency_contact: {
        name: 'Deepak Gupta',
        relationship: 'Father',
        phone: '9876599004',
      },
      stats: {
        completed_rides_as_driver: 0,
        completed_rides_as_passenger: 7,
        total_reviews: 0,
        average_rating: 5.0,
      },
    });

    // 6. Passenger 2 - Devansh Singh
    const passengerDevansh = await User.create({
      name: 'Devansh Singh',
      email: 'devansh.singh@cumail.in',
      phone: '9876500005',
      student_id: 'CUUP2025CS0412',
      course: 'B.Tech CSE - Artificial Intelligence',
      semester: '2nd Semester',
      password: 'Password@123',
      verification_status: 'verified',
      role: 'student',
      emergency_contact: {
        name: 'Meena Singh',
        relationship: 'Mother',
        phone: '9876599005',
      },
      stats: {
        completed_rides_as_driver: 0,
        completed_rides_as_passenger: 4,
        total_reviews: 0,
        average_rating: 5.0,
      },
    });

    console.log('[Seed] Registering Vehicles...');

    // Vehicles
    const vehicleAarav = await Vehicle.create({
      owner_id: driverAarav._id,
      vehicle_model: 'Hyundai i10 Magna',
      registration_number: 'UP32 AB 1234',
      colour: 'Metallic Silver',
      vehicle_type: 'Hatchback',
      ac_available: true,
      luggage_capacity: 'Medium Luggage',
      rc_number: 'UP3220220019283',
      verification_status: 'verified',
    });

    const vehiclePriya = await Vehicle.create({
      owner_id: driverPriya._id,
      vehicle_model: 'Maruti Suzuki Swift ZXi',
      registration_number: 'UP32 BC 5678',
      colour: 'Arctic White',
      vehicle_type: 'Hatchback',
      ac_available: true,
      luggage_capacity: 'Medium Luggage',
      rc_number: 'UP3220230048192',
      verification_status: 'verified',
    });

    const vehicleRohan = await Vehicle.create({
      owner_id: driverRohan._id,
      vehicle_model: 'Honda City 5th Gen V',
      registration_number: 'UP78 CK 9988',
      colour: 'Platinum White Pearl',
      vehicle_type: 'Sedan',
      ac_available: true,
      luggage_capacity: 'Large Suitcases',
      rc_number: 'UP7820210088112',
      verification_status: 'verified',
    });

    console.log('[Seed] Creating Student Verifications...');
    await StudentVerification.create([
      {
        user_id: driverAarav._id,
        student_id_number: 'CUUP2024CS0142',
        id_card_front_image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        course: driverAarav.course,
        semester: driverAarav.semester,
        status: 'approved',
        reviewed_by: admin._id,
        reviewed_at: Date.now(),
      },
      {
        user_id: passengerAnanya._id,
        student_id_number: 'CUUP2024BCA0110',
        id_card_front_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        course: passengerAnanya.course,
        semester: passengerAnanya.semester,
        status: 'approved',
        reviewed_by: admin._id,
        reviewed_at: Date.now(),
      },
    ]);

    console.log('[Seed] Setting up completed trip for rating demonstration...');

    // Past Ride: Completed Ride for Review Display
    const pastRide = await Ride.create({
      driver_id: driverAarav._id,
      vehicle_id: vehicleAarav._id,
      source: 'Chandigarh University UP Campus, Lucknow',
      destination: 'Kanpur',
      pickup_location: 'CUUP Main Gate',
      drop_location: 'Z Square Mall, Kanpur',
      journey_date: '2026-11-10',
      departure_time: '04:00 PM',
      expected_arrival: '05:45 PM',
      total_seats: 3,
      available_seats: 0,
      booked_seats: 3,
      cost_per_seat: 250,
      ac_available: true,
      luggage_capacity: 'Medium Luggage',
      ride_status: 'completed',
      started_at: new Date(Date.now() - 3 * 86400000),
      completed_at: new Date(Date.now() - 3 * 86400000 + 7200000),
    });

    console.log('[Seed] Creating Bookings & Driving Experience Reviews...');

    // Booking on past ride
    const pastBooking1 = await Booking.create({
      ride_id: pastRide._id,
      passenger_id: passengerAnanya._id,
      driver_id: driverAarav._id,
      seats_booked: 1,
      total_cost: 250,
      booking_status: 'completed',
      payment_status: 'upi_declared',
      payment_reference: 'UPI/2026/CUUP/998124',
      has_reviewed: true,
    });

    // 5-Star Driving Experience Review
    await Review.create({
      ride_id: pastRide._id,
      booking_id: pastBooking1._id,
      driver_id: driverAarav._id,
      passenger_id: passengerAnanya._id,
      safety_rating: 5,
      behaviour_rating: 5,
      punctuality_rating: 5,
      communication_rating: 5,
      overall_rating: 5,
      review_text:
        'Ananya is an exceptionally responsible driver! Maintained safe speed on NH-27, no harsh braking, very courteous behaviour, and was right on time at CUUP main gate. Highly recommended for Kanpur trips.',
    });

    // Notifications
    await Notification.create([
      {
        user_id: passengerAnanya._id,
        title: 'Ride Completed! 🎉',
        body: 'Your journey from CUUP to Kanpur with Ananya Sharma was completed.',
        type: 'ride_completed',
        data: { ride_id: pastRide._id, booking_id: pastBooking1._id },
      },
      {
        user_id: driverAarav._id,
        title: 'New 5-Star Review Received ⭐',
        body: 'Aditi reviewed your driving on the Kanpur trip: "Ananya is an exceptionally responsible driver..."',
        type: 'system',
        data: { ride_id: pastRide._id },
      },
    ]);

    // Emergency Contacts
    await EmergencyContact.create([
      {
        user_id: passengerAnanya._id,
        name: 'Deepak Gupta',
        relationship: 'Father',
        phone_number: '9876599004',
        is_primary: true,
      },
      {
        user_id: passengerAnanya._id,
        name: 'CUUP Campus Security',
        relationship: 'Campus Warden',
        phone_number: '+91 522 6688000',
        is_primary: false,
      },
    ]);

    // Safety Report Example
    await Report.create({
      reporter_id: passengerDevansh._id,
      reported_user_id: driverRohan._id,
      ride_id: pastRide._id,
      report_type: 'other',
      reason: 'Inquiry regarding student carpool rules',
      details: 'Student requested clarification on fuel cost sharing guidelines for campus commuters.',
      status: 'resolved',
      action_taken: 'Shared CUUP student carpooling charter guidelines.',
      resolved_by: admin._id,
      resolved_at: Date.now(),
    });

    // Audit Log Examples
    await AuditLog.create([
      {
        user_id: admin._id,
        action: 'SYSTEM_INITIALIZATION',
        entity_type: 'System',
        details: { platform: 'Campus Drivers - Chandigarh University UP' },
      },
      {
        user_id: driverAarav._id,
        action: 'RIDE_OFFERED',
        entity_type: 'Ride',
        entity_id: String(pastRide._id),
        details: { destination: 'Kanpur', vehicle: 'UP32 AB 1234' },
      },
    ]);

    console.log('[Seed] Data seeded successfully! 🎉');
    console.log('----------------------------------------------------');
    console.log('🔑 TEST CREDENTIALS:');
    console.log('👑 Admin:');
    console.log('   Email:    admin@campusdrivers.cu.ac.in');
    console.log('   Password: Password@123');
    console.log('🚗 Driver (Verified Student with UP Car & Reviews):');
    console.log('   Email:    aarav.sharma@cumail.in');
    console.log('   Password: Password@123');
    console.log('   Vehicle:  Hyundai i10 (UP32 AB 1234)');
    console.log('🙋 Passenger (Verified Student):');
    console.log('   Email:    ananya.gupta@cumail.in');
    console.log('   Password: Password@123');
    console.log('----------------------------------------------------');

    return true;
  } catch (err) {
    console.error('[Seed Error]', err);
    throw err;
  }
};

// Run directly if called from command line
if (require.main === module) {
  seedData()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await disconnectDB();
      process.exit(1);
    });
}

module.exports = { seedData };
