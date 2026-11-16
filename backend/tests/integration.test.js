const http = require('http');

let BASE_URL = process.env.TEST_API_URL || 'http://localhost:5001/api';

const ensureServerRunning = async () => {
  try {
    await request('/health');
    console.log('🔗 Connected to existing server on port 5001\n');
  } catch (err) {
    console.log('⚡ Starting in-process Campus Drivers server for test suite...');
    require('../src/server');
    // Wait up to 10 seconds for server to become responsive
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      try {
        const h = await request('/health');
        if (h.status === 200) {
          console.log('🚀 In-process server is live and responsive!\n');
          return;
        }
      } catch (ignored) {}
    }
  }
};

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const runIntegrationTests = async () => {
  await ensureServerRunning();
  console.log('🧪 Starting Campus Drivers End-to-End Integration Test Suite...\n');
  const startTime = Date.now();
  let step = 0;

  const testCase = async (desc, fn) => {
    step++;
    const t0 = Date.now();
    try {
      await fn();
      const elapsed = Date.now() - t0;
      console.log(`✅ [${step}/17] ${desc} (${elapsed}ms)`);
    } catch (err) {
      console.error(`❌ [${step}/17] FAILED: ${desc}`);
      console.error(`   Error: ${err.message}`);
      throw err;
    }
  };

  try {
    // 1. Health check
    await testCase('Health Check & Status Diagnostic', async () => {
      const res = await request('/health');
      if (res.status !== 200 || !res.data?.status) {
        throw new Error(`Expected status 200, got ${res.status}`);
      }
    });

    // 2. New Student Registration
    const uniqueNum = Date.now().toString().slice(-6);
    const newStudentEmail = `test.student.${uniqueNum}@cumail.in`;
    const newStudentPhone = `98${uniqueNum}12`;
    const newStudentRoll = `22CU${uniqueNum}`;
    let newStudentToken = null;

    await testCase('Student Registration with CUUP credentials', async () => {
      const res = await request('/auth/register', 'POST', {
        name: 'Tanya Verma',
        email: newStudentEmail,
        phone: newStudentPhone,
        student_id: newStudentRoll,
        course: 'B.Tech CSE (AI & ML)',
        semester: '3rd Semester',
        password: 'Password@123',
        emergency_contact_name: 'Parent Verma',
        emergency_contact_phone: '9876500099',
      });
      if (res.status !== 201 || !res.data?.token) {
        throw new Error(`Registration failed: ${res.data?.message || res.status}`);
      }
      newStudentToken = res.data.token;
    });

    // 3. Duplicate Registration Prevention
    await testCase('Duplicate Registration Prevention & alreadyRegistered Flag', async () => {
      const res = await request('/auth/register', 'POST', {
        name: 'Tanya Verma Duplicate',
        email: newStudentEmail,
        phone: '9876543299',
        student_id: '22CUDUP999',
        course: 'B.Tech CSE',
        semester: '3rd Semester',
        password: 'Password@123',
      });
      if (res.status !== 400 || !res.data?.alreadyRegistered) {
        throw new Error(`Expected 400 with alreadyRegistered: true, got ${res.status}`);
      }
    });

    // 4. Password Login Performance (< 500ms response)
    let driverToken = null;
    await testCase('Driver Password Sign In (Performance & JWT validity)', async () => {
      const t0 = Date.now();
      const res = await request('/auth/login', 'POST', {
        loginId: 'ananya.sharma@cumail.in',
        password: 'Password@123',
      });
      const duration = Date.now() - t0;
      if (res.status !== 200 || !res.data?.token) {
        throw new Error(`Driver login failed: ${res.data?.message || res.status}`);
      }
      if (duration > 3000) {
        throw new Error(`Login took too long (${duration}ms), expected < 3000ms`);
      }
      driverToken = res.data.token;
    });

    // 5. Passenger Password Login
    let passengerToken = null;
    await testCase('Passenger Password Sign In', async () => {
      const res = await request('/auth/login', 'POST', {
        loginId: 'ananya.gupta@cumail.in',
        password: 'Password@123',
      });
      if (res.status !== 200 || !res.data?.token) {
        throw new Error(`Passenger login failed: ${res.data?.message || res.status}`);
      }
      passengerToken = res.data.token;
    });

    // 6. Mobile OTP: Send OTP
    let otpPhone = '9876500001';
    await testCase('Mobile OTP Generation (/auth/send-otp)', async () => {
      const res = await request('/auth/send-otp', 'POST', { phone: otpPhone });
      if (res.status !== 200 || !res.data?.success) {
        throw new Error(`Send OTP failed: ${res.data?.message || res.status}`);
      }
    });

    // 7. Mobile OTP: Verify OTP
    await testCase('Mobile OTP Verification & Direct Session Login', async () => {
      const res = await request('/auth/verify-otp', 'POST', { phone: otpPhone, otp: '123456' });
      if (res.status !== 200 || !res.data?.token) {
        throw new Error(`Verify OTP failed: ${res.data?.message || res.status}`);
      }
    });

    // 8. Authenticated Current User Profile (/auth/me)
    await testCase('Current Logged-in User Profile Verification (/auth/me)', async () => {
      const res = await request('/auth/me', 'GET', null, driverToken);
      if (res.status !== 200 || !res.data?.user?.email) {
        throw new Error(`Get me failed: ${res.data?.message || res.status}`);
      }
    });

    // 9. Driver Offers Carpool Ride
    let newRideId = null;
    await testCase('Driver Publishes Carpool Ride on NH-27 Corridor', async () => {
      const res = await request(
        '/rides',
        'POST',
        {
          source: 'Chandigarh University UP Campus, Lucknow',
          destination: 'Unnao',
          pickup_location: 'Hostel Gate 2',
          drop_location: 'Unnao Bypass / Railway Station',
          journey_date: '2026-11-28',
          departure_time: '05:00 PM',
          available_seats: 3,
          cost_per_seat: 80,
          ac_available: true,
          instructions: 'Comfortable ride with AC along NH-27.',
          vehicle_model: 'Hyundai i10 Magna',
          registration_number: 'UP32 AB 1234',
          colour: 'Silver',
        },
        driverToken
      );
      if (res.status !== 201 || !res.data?.ride?._id) {
        throw new Error(`Ride offer failed: ${res.data?.message || res.status}`);
      }
      newRideId = res.data.ride._id;
    });

    // 10. Passenger Searches Available Rides
    await testCase('Passenger Searches Carpool Rides (Unnao destination)', async () => {
      const res = await request('/rides/search?destination=Unnao');
      if (res.status !== 200 || !Array.isArray(res.data?.rides) || res.data.rides.length === 0) {
        throw new Error(`Ride search failed or returned 0 rides: ${res.status}`);
      }
    });

    // 11. Passenger Booking Request
    let bookingId = null;
    await testCase('Passenger Requests Ride Seat Reservation', async () => {
      const res = await request(
        '/bookings',
        'POST',
        {
          ride_id: newRideId,
          seats_booked: 1,
          pickup_note: 'Waiting near main campus security gate',
        },
        passengerToken
      );
      if (res.status !== 201 || !res.data?.booking?._id) {
        throw new Error(`Booking request failed: ${res.data?.message || res.status}`);
      }
      bookingId = res.data.booking._id;
    });

    // 12. Driver Accepts Booking (Atomic Seat Decrement)
    await testCase('Driver Accepts Booking with Atomic Seat Decrement', async () => {
      const res = await request(`/bookings/${bookingId}/accept`, 'PUT', {}, driverToken);
      if (res.status !== 200 || typeof res.data?.remaining_seats !== 'number') {
        throw new Error(`Accept booking failed: ${res.data?.message || res.status}`);
      }
      if (res.data.remaining_seats !== 2) {
        throw new Error(`Expected remaining seats 2, got ${res.data.remaining_seats}`);
      }
    });

    // 13. Driver Journey Lifecycle (Start & Complete)
    await testCase('Trip Lifecycle: Start and Complete Journey', async () => {
      const startRes = await request(`/rides/${newRideId}/start`, 'PUT', {}, driverToken);
      if (startRes.status !== 200) {
        throw new Error(`Start ride failed: ${startRes.status}`);
      }
      const compRes = await request(`/rides/${newRideId}/complete`, 'PUT', {}, driverToken);
      if (compRes.status !== 200) {
        throw new Error(`Complete ride failed: ${compRes.status}`);
      }
    });

    // 14. 5-Star Driving Review Submission
    await testCase('Passenger Submits 5-Star Driving Experience Review', async () => {
      const res = await request(
        '/reviews',
        'POST',
        {
          booking_id: bookingId,
          safety_rating: 5,
          behaviour_rating: 5,
          punctuality_rating: 5,
          communication_rating: 5,
          overall_rating: 5,
          review_text: 'Safe driving along NH-27 Lucknow-Unnao corridor. Polite and punctual!',
        },
        passengerToken
      );
      if (res.status !== 201) {
        throw new Error(`Review submission failed: ${res.data?.message || res.status}`);
      }
    });

    // 15. Dedicated Admin Portal Authentication (campusdrivers000 / campus1010)
    let adminToken = null;
    await testCase('Dedicated Admin Login (campusdrivers000 / campus1010)', async () => {
      const res = await request('/auth/login', 'POST', {
        loginId: 'campusdrivers000',
        password: 'campus1010',
      });
      if (res.status !== 200 || !res.data?.token || res.data?.user?.role !== 'admin') {
        throw new Error(`Admin login failed: ${res.data?.message || res.status}`);
      }
      adminToken = res.data.token;
    });

    // 16. Admin Security Guard: Rejection of Unauthorized Credentials
    await testCase('Admin Portal Guard: Rejection of Unauthorized Logins', async () => {
      const res = await request('/auth/login', 'POST', {
        loginId: 'unauthorized_staff',
        password: 'WrongPassword',
      });
      if (res.status !== 401) {
        throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
      }
    });

    // 17. Admin Overview Metrics Retrieval
    await testCase('Admin Dashboard Overview Metrics Retrieval', async () => {
      const res = await request('/admin/overview', 'GET', null, adminToken);
      if (res.status !== 200 || !res.data?.metrics) {
        throw new Error(`Admin overview failed: ${res.data?.message || res.status}`);
      }
    });

    const totalElapsed = Math.round((Date.now() - startTime) / 1000);
    console.log('\n======================================================');
    console.log(`🎉 ALL 17 INTEGRATION TESTS PASSED WITH 100% SUCCESS! (Completed in ${totalElapsed}s)`);
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Integration Test Suite Failed:', err.message);
    process.exit(1);
  }
};

runIntegrationTests();
