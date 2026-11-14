const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
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
const RideRequest = require('../models/RideRequest');
const Payment = require('../models/Payment');
const Message = require('../models/Message');
const TripLocation = require('../models/TripLocation');

// Helper to format ISO dates (YYYY-MM-DD) relative to today
const formatDate = (daysAhead = 0) => {
  const d = new Date(Date.now() + daysAhead * 86400000);
  return d.toISOString().split('T')[0];
};

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] 🧹 Flushing all existing collections for clean state...');
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
      RideRequest.deleteMany({}),
      Payment.deleteMany({}),
      Message.deleteMany({}),
      TripLocation.deleteMany({}),
    ]);

    console.log('[Seed] Creating dedicated Admin account...');

    // 1. Official Admin Account
    const admin = await User.create({
      name: 'Campus Drivers Administration',
      email: 'campusdrivers000@campusdrivers.cu.ac.in',
      phone: '9876543210',
      student_id: 'CAMPUSDRIVERS000',
      course: 'Office of Student Welfare & Transport',
      semester: 'Staff',
      password: 'campus1010',
      verification_status: 'verified',
      role: 'admin',
      emergency_contact: {
        name: 'Campus Security Control Room',
        relationship: 'Campus Authority',
        phone: '+91 522 6688000',
      },
    });

    console.log('[Seed] Creating verified Student Drivers...');

    // 2. Driver 1 - Ananya Sharma (Hyundai i10 Magna - UP32 AB 1234)
    const driverAnanya = await User.create({
      name: 'Ananya Sharma',
      email: 'ananya.sharma@cumail.in',
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
        completed_rides_as_driver: 16,
        completed_rides_as_passenger: 3,
        total_reviews: 12,
        average_rating: 4.9,
        safety_score: 5.0,
        punctuality_score: 4.9,
        behaviour_score: 5.0,
        communication_score: 4.9,
      },
    });

    // 3. Driver 2 - Priya Verma (Maruti Swift ZXi - UP32 BC 5678)
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
        completed_rides_as_driver: 10,
        completed_rides_as_passenger: 4,
        total_reviews: 8,
        average_rating: 4.8,
        safety_score: 4.9,
        punctuality_score: 4.8,
        behaviour_score: 5.0,
        communication_score: 4.8,
      },
    });

    // 4. Driver 3 - Rohan Tripathi (Honda City V - UP78 CK 9988)
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
        completed_rides_as_driver: 24,
        completed_rides_as_passenger: 6,
        total_reviews: 18,
        average_rating: 5.0,
        safety_score: 5.0,
        punctuality_score: 4.9,
        behaviour_score: 5.0,
        communication_score: 5.0,
      },
    });

    // 5. Driver 4 - Kartik Mishra (Tata Nexon Creative - UP32 NX 4040)
    const driverKartik = await User.create({
      name: 'Kartik Mishra',
      email: 'kartik.mishra@cumail.in',
      phone: '9876500006',
      student_id: 'CUUP2024CS0219',
      course: 'B.Tech AI & Data Science',
      semester: '4th Semester',
      password: 'Password@123',
      verification_status: 'verified',
      role: 'driver',
      is_driver_approved: true,
      emergency_contact: {
        name: 'Suresh Mishra',
        relationship: 'Father',
        phone: '9876599006',
      },
      stats: {
        completed_rides_as_driver: 12,
        completed_rides_as_passenger: 2,
        total_reviews: 9,
        average_rating: 4.9,
        safety_score: 5.0,
        punctuality_score: 4.8,
        behaviour_score: 5.0,
        communication_score: 4.9,
      },
    });

    console.log('[Seed] Creating verified Student Passengers...');

    // 6. Passenger 1 - Ananya Gupta
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
        completed_rides_as_passenger: 8,
        total_reviews: 0,
        average_rating: 5.0,
      },
    });

    // 7. Passenger 2 - Devansh Singh
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
        completed_rides_as_passenger: 5,
        total_reviews: 0,
        average_rating: 5.0,
      },
    });

    // 8. Passenger 3 - Simran Kaur
    const passengerSimran = await User.create({
      name: 'Simran Kaur',
      email: 'simran.kaur@cumail.in',
      phone: '9876500007',
      student_id: 'CUUP2024BBA0091',
      course: 'BBA Financial Management',
      semester: '4th Semester',
      password: 'Password@123',
      verification_status: 'verified',
      role: 'student',
      emergency_contact: {
        name: 'Harpreet Singh',
        relationship: 'Father',
        phone: '9876599007',
      },
      stats: {
        completed_rides_as_driver: 0,
        completed_rides_as_passenger: 6,
        total_reviews: 0,
        average_rating: 5.0,
      },
    });

    // 9. Passenger 4 - Aman Verma
    const passengerAman = await User.create({
      name: 'Aman Verma',
      email: 'aman.verma@cumail.in',
      phone: '9876500008',
      student_id: 'CUUP2023CE0042',
      course: 'B.Tech Civil Engineering',
      semester: '6th Semester',
      password: 'Password@123',
      verification_status: 'verified',
      role: 'student',
      emergency_contact: {
        name: 'Kailash Verma',
        relationship: 'Father',
        phone: '9876599008',
      },
      stats: {
        completed_rides_as_driver: 0,
        completed_rides_as_passenger: 7,
        total_reviews: 0,
        average_rating: 5.0,
      },
    });

    // 10. Student with Pending ID Review (for Admin ID review verification)
    const studentPending = await User.create({
      name: 'Ayush Shukla',
      email: 'ayush.shukla@cumail.in',
      phone: '9876500009',
      student_id: 'CUUP2025ME0189',
      course: 'B.Tech Mechanical Engineering',
      semester: '2nd Semester',
      password: 'Password@123',
      verification_status: 'pending',
      role: 'student',
      emergency_contact: {
        name: 'S.P. Shukla',
        relationship: 'Father',
        phone: '9876599009',
      },
      stats: {
        completed_rides_as_driver: 0,
        completed_rides_as_passenger: 0,
        total_reviews: 0,
        average_rating: 5.0,
      },
    });

    console.log('[Seed] Registering Verified Student Vehicles...');

    // Vehicles
    const vehicleAnanya = await Vehicle.create({
      owner_id: driverAnanya._id,
      vehicle_model: 'Hyundai i10 Magna',
      registration_number: 'UP32 AB 1234',
      colour: 'Metallic Silver',
      vehicle_type: 'Hatchback',
      ac_available: true,
      luggage_capacity: 'Medium Luggage',
      rc_number: 'UP3220220019283',
      verification_status: 'verified',
      is_active: true,
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
      is_active: true,
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
      is_active: true,
    });

    const vehicleKartik = await Vehicle.create({
      owner_id: driverKartik._id,
      vehicle_model: 'Tata Nexon Creative',
      registration_number: 'UP32 NX 4040',
      colour: 'Daytona Grey',
      vehicle_type: 'SUV',
      ac_available: true,
      luggage_capacity: 'Large Suitcases',
      rc_number: 'UP3220240091823',
      verification_status: 'verified',
      is_active: true,
    });

    console.log('[Seed] Creating Driver Documents...');
    await Promise.all([
      DriverDocument.create({
        driver_id: driverAnanya._id,
        license_number: 'UP32 20220019283',
        license_front_image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        driving_experience_years: 2,
        verification_status: 'verified',
        reviewed_by: admin._id,
      }),
      DriverDocument.create({
        driver_id: driverPriya._id,
        license_number: 'UP32 20230048192',
        license_front_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        driving_experience_years: 3,
        verification_status: 'verified',
        reviewed_by: admin._id,
      }),
      DriverDocument.create({
        driver_id: driverRohan._id,
        license_number: 'UP78 20210088112',
        license_front_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        driving_experience_years: 4,
        verification_status: 'verified',
        reviewed_by: admin._id,
      }),
      DriverDocument.create({
        driver_id: driverKartik._id,
        license_number: 'UP32 20240091823',
        license_front_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        driving_experience_years: 2,
        verification_status: 'verified',
        reviewed_by: admin._id,
      }),
    ]);

    console.log('[Seed] Creating Student Verifications...');
    await StudentVerification.create([
      {
        user_id: driverAnanya._id,
        student_id_number: 'CUUP2024CS0142',
        id_card_front_image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        course: driverAnanya.course,
        semester: driverAnanya.semester,
        status: 'approved',
        reviewed_by: admin._id,
        reviewed_at: new Date(),
      },
      {
        user_id: driverPriya._id,
        student_id_number: 'CUUP2023MBA0088',
        id_card_front_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        course: driverPriya.course,
        semester: driverPriya.semester,
        status: 'approved',
        reviewed_by: admin._id,
        reviewed_at: new Date(),
      },
      {
        user_id: driverRohan._id,
        student_id_number: 'CUUP2024ME0055',
        id_card_front_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        course: driverRohan.course,
        semester: driverRohan.semester,
        status: 'approved',
        reviewed_by: admin._id,
        reviewed_at: new Date(),
      },
      {
        user_id: passengerAnanya._id,
        student_id_number: 'CUUP2024BCA0110',
        id_card_front_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        course: passengerAnanya.course,
        semester: passengerAnanya.semester,
        status: 'approved',
        reviewed_by: admin._id,
        reviewed_at: new Date(),
      },
      {
        user_id: studentPending._id,
        student_id_number: 'CUUP2025ME0189',
        id_card_front_image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
        course: studentPending.course,
        semester: studentPending.semester,
        status: 'pending',
        submitted_at: new Date(),
      },
    ]);

    console.log('[Seed] Creating Active & Upcoming Carpool Rides...');

    // ACTIVE RIDE 1: CUUP Main Gate -> Kanpur (Z Square Mall / Kanpur Central)
    const activeRide1 = await Ride.create({
      driver_id: driverAnanya._id,
      vehicle_id: vehicleAnanya._id,
      source: 'Chandigarh University UP Campus, Lucknow',
      destination: 'Kanpur',
      pickup_location: 'CUUP Main Gate, NH-27',
      drop_location: 'Z Square Mall / Kanpur Central',
      journey_date: formatDate(1), // Tomorrow
      departure_time: '04:30 PM',
      expected_arrival: '06:15 PM',
      total_seats: 4,
      available_seats: 3,
      booked_seats: 1,
      cost_per_seat: 180,
      ac_available: true,
      luggage_capacity: 'Medium Luggage',
      instructions: 'Leaving promptly from CUUP main gate. Clean AC car, student ID required at boarding.',
      ride_status: 'published',
      share_token: crypto.randomBytes(16).toString('hex'),
    });

    // ACTIVE RIDE 2: CUUP Gate 2 -> Lucknow (Charbagh Railway Station / Alambagh)
    const activeRide2 = await Ride.create({
      driver_id: driverPriya._id,
      vehicle_id: vehiclePriya._id,
      source: 'Chandigarh University UP Campus, Lucknow',
      destination: 'Lucknow',
      pickup_location: 'CUUP Gate 2, Lucknow',
      drop_location: 'Charbagh Railway Station / Alambagh Metro',
      journey_date: formatDate(1), // Tomorrow
      departure_time: '05:15 PM',
      expected_arrival: '06:00 PM',
      total_seats: 4,
      available_seats: 3,
      booked_seats: 1,
      cost_per_seat: 120,
      ac_available: true,
      luggage_capacity: 'Medium Luggage',
      instructions: 'Direct ride to Charbagh via Kanpur road bypass. Polite student co-passengers only.',
      ride_status: 'published',
      share_token: crypto.randomBytes(16).toString('hex'),
    });

    // ACTIVE RIDE 3: CUUP Student Center -> Gomti Nagar / Hazratganj
    const activeRide3 = await Ride.create({
      driver_id: driverRohan._id,
      vehicle_id: vehicleRohan._id,
      source: 'Chandigarh University UP Campus, Lucknow',
      destination: 'Gomti Nagar',
      pickup_location: 'CUUP Student Center, Main Gate',
      drop_location: 'Patrakarpuram / Hazratganj, Lucknow',
      journey_date: formatDate(2), // In 2 days
      departure_time: '09:30 AM',
      expected_arrival: '10:30 AM',
      total_seats: 4,
      available_seats: 2,
      booked_seats: 2,
      cost_per_seat: 140,
      ac_available: true,
      luggage_capacity: 'Large Suitcases',
      instructions: 'Spacious sedan with large boot space. AC on throughout. Drop available up to Hazratganj.',
      ride_status: 'published',
      share_token: crypto.randomBytes(16).toString('hex'),
    });

    // ACTIVE RIDE 4: CUUP Main Campus Gate -> Unnao (Bypass / Shukla Ganj)
    const activeRide4 = await Ride.create({
      driver_id: driverKartik._id,
      vehicle_id: vehicleKartik._id,
      source: 'Chandigarh University UP Campus, Lucknow',
      destination: 'Unnao',
      pickup_location: 'CUUP Main Campus Gate',
      drop_location: 'Unnao Bypass / Shukla Ganj',
      journey_date: formatDate(2), // In 2 days
      departure_time: '02:00 PM',
      expected_arrival: '02:40 PM',
      total_seats: 4,
      available_seats: 4,
      booked_seats: 0,
      cost_per_seat: 100,
      ac_available: true,
      luggage_capacity: 'Large Suitcases',
      instructions: 'High ground clearance SUV, comfortable travel, strictly verified CUUP students only.',
      ride_status: 'published',
      share_token: crypto.randomBytes(16).toString('hex'),
    });

    console.log('[Seed] Setting up completed past ride & ratings history...');

    // PAST RIDE: Completed Trip for reviews & performance display
    const pastRide = await Ride.create({
      driver_id: driverAnanya._id,
      vehicle_id: vehicleAnanya._id,
      source: 'Chandigarh University UP Campus, Lucknow',
      destination: 'Kanpur',
      pickup_location: 'CUUP Main Gate, NH-27',
      drop_location: 'Kanpur Central Railway Station',
      journey_date: formatDate(-3), // 3 days ago
      departure_time: '04:00 PM',
      expected_arrival: '05:45 PM',
      total_seats: 4,
      available_seats: 0,
      booked_seats: 4,
      cost_per_seat: 180,
      ac_available: true,
      luggage_capacity: 'Medium Luggage',
      ride_status: 'completed',
      share_token: crypto.randomBytes(16).toString('hex'),
      started_at: new Date(Date.now() - 3 * 86400000),
      completed_at: new Date(Date.now() - 3 * 86400000 + 6300000),
    });

    console.log('[Seed] Creating Active & Past Bookings...');

    // Booking on Active Ride 1
    const activeBooking1 = await Booking.create({
      ride_id: activeRide1._id,
      passenger_id: passengerAnanya._id,
      driver_id: driverAnanya._id,
      seats_booked: 1,
      total_cost: 180,
      booking_status: 'confirmed',
      payment_status: 'upi_declared',
      payment_reference: 'UPI/CUUP/2026/884912',
      pickup_note: 'Waiting right at CUUP main gate security kiosk.',
    });

    // Booking on Active Ride 2
    const activeBooking2 = await Booking.create({
      ride_id: activeRide2._id,
      passenger_id: passengerDevansh._id,
      driver_id: driverPriya._id,
      seats_booked: 1,
      total_cost: 120,
      booking_status: 'confirmed',
      payment_status: 'upi_declared',
      payment_reference: 'UPI/CUUP/2026/771239',
      pickup_note: 'Boarding near hostel block 2 road.',
    });

    // Bookings on Active Ride 3
    await Booking.create([
      {
        ride_id: activeRide3._id,
        passenger_id: passengerSimran._id,
        driver_id: driverRohan._id,
        seats_booked: 1,
        total_cost: 140,
        booking_status: 'confirmed',
        payment_status: 'upi_declared',
        payment_reference: 'UPI/CUUP/2026/660144',
      },
      {
        ride_id: activeRide3._id,
        passenger_id: passengerAman._id,
        driver_id: driverRohan._id,
        seats_booked: 1,
        total_cost: 140,
        booking_status: 'confirmed',
        payment_status: 'cash_declared',
      },
    ]);

    // Booking on Past Completed Ride
    const pastBooking = await Booking.create({
      ride_id: pastRide._id,
      passenger_id: passengerAnanya._id,
      driver_id: driverAnanya._id,
      seats_booked: 1,
      total_cost: 180,
      booking_status: 'completed',
      payment_status: 'upi_declared',
      payment_reference: 'UPI/CUUP/2026/552109',
      has_reviewed: true,
    });

    console.log('[Seed] Creating 5-Star Driving Experience Review...');
    await Review.create({
      ride_id: pastRide._id,
      booking_id: pastBooking._id,
      driver_id: driverAnanya._id,
      passenger_id: passengerAnanya._id,
      safety_rating: 5,
      behaviour_rating: 5,
      punctuality_rating: 5,
      communication_rating: 5,
      overall_rating: 5,
      review_text:
        'Ananya is an exceptionally courteous and punctual driver. Followed safe speed on NH-27, no sudden lane changes, and vehicle was spotless. Best carpooling experience at CUUP!',
    });

    console.log('[Seed] Creating Realistic Campus Notifications...');
    await Notification.create([
      {
        user_id: passengerAnanya._id,
        title: 'Ride Confirmed! 🚗',
        body: 'Your ride to Kanpur with Ananya Sharma has been confirmed. Departure: ' + activeRide1.departure_time,
        type: 'booking_accepted',
        data: { ride_id: activeRide1._id, booking_id: activeBooking1._id },
      },
      {
        user_id: passengerDevansh._id,
        title: 'Seat Reserved Successfully ✅',
        body: 'Your seat with Priya Verma to Lucknow Charbagh is confirmed.',
        type: 'booking_accepted',
        data: { ride_id: activeRide2._id, booking_id: activeBooking2._id },
      },
      {
        user_id: driverAnanya._id,
        title: 'New Passenger Joined Your Ride 🙋',
        body: 'Ananya Gupta booked 1 seat on your upcoming trip to Kanpur.',
        type: 'booking_confirmed',
        data: { ride_id: activeRide1._id },
      },
    ]);

    console.log('[Seed] Creating Emergency Contacts...');
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

    console.log('[Seed] Creating Campus Safety Inquiries Report...');
    await Report.create({
      reporter_id: passengerDevansh._id,
      reported_user_id: driverRohan._id,
      ride_id: activeRide3._id,
      report_type: 'other',
      reason: 'Inquiry regarding student carpool rules',
      details: 'Student requested clarification on fuel cost sharing guidelines for daily commuters.',
      status: 'resolved',
      action_taken: 'Shared CUUP official student carpooling charter document.',
      resolved_by: admin._id,
      resolved_at: new Date(),
    });

    console.log('[Seed] Generating Security Audit Trail...');
    await AuditLog.create([
      {
        user_id: admin._id,
        action: 'SYSTEM_INITIALIZATION',
        entity_type: 'System',
        details: { platform: 'Campus Drivers - Chandigarh University Uttar Pradesh (Lucknow)' },
      },
      {
        user_id: admin._id,
        action: 'STUDENT_VERIFIED',
        entity_type: 'User',
        entity_id: String(driverAnanya._id),
        details: { roll: driverAnanya.student_id, name: driverAnanya.name },
      },
      {
        user_id: driverAnanya._id,
        action: 'RIDE_OFFERED',
        entity_type: 'Ride',
        entity_id: String(activeRide1._id),
        details: { destination: 'Kanpur', vehicle: 'UP32 AB 1234' },
      },
    ]);

    console.log('====================================================');
    console.log('✅ FRESH DATABASE SEEDED SUCCESSFULLY! 🎉');
    console.log('====================================================');
    console.log('👑 Admin Portal Login:');
    console.log('   ID:       campusdrivers000');
    console.log('   Password: campus1010');
    console.log('🚗 Active Rides Offered: 4 Upcoming Trips (Kanpur, Lucknow, Gomti Nagar, Unnao)');
    console.log('👥 Total Verified Students & Drivers: 9');
    console.log('📋 Pending ID Verification Reviews: 1 (Ayush Shukla)');
    console.log('====================================================');

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
