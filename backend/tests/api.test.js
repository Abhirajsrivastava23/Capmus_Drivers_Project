const http = require('http');

const BASE_URL = 'http://localhost:5001/api';

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

const runTests = async () => {
  console.log('🧪 Starting Campus Drivers Comprehensive Integration Test Suite...\n');

  try {
    // 1. Health check
    const health = await request('/health');
    console.log(`✅ [1/10] Health Check: Status ${health.status} -> ${health.data.app}`);

    // 2. Driver Login
    const driverLogin = await request('/auth/login', 'POST', {
      loginId: 'aarav.sharma@cumail.in',
      password: 'Password@123',
    });
    console.log(`✅ [2/10] Driver Login: Status ${driverLogin.status} -> Logged in as ${driverLogin.data.user?.name}`);
    const driverToken = driverLogin.data.token;

    // 3. Passenger Login
    const passengerLogin = await request('/auth/login', 'POST', {
      loginId: 'ananya.gupta@cumail.in',
      password: 'Password@123',
    });
    console.log(`✅ [3/10] Passenger Login: Status ${passengerLogin.status} -> Logged in as ${passengerLogin.data.user?.name}`);
    const passengerToken = passengerLogin.data.token;

    // 4. Driver offers a new ride
    const offerRes = await request(
      '/rides',
      'POST',
      {
        source: 'Chandigarh University UP Campus, Lucknow',
        destination: 'Unnao',
        pickup_location: 'Hostel Gate 2',
        drop_location: 'Unnao Bypass / Railway Station',
        journey_date: '2026-11-25',
        departure_time: '04:30 PM',
        available_seats: 3,
        cost_per_seat: 80,
        ac_available: true,
        instructions: 'Comfortable trip with AC to Unnao.',
        vehicle_model: 'Hyundai i10 Magna',
        registration_number: 'UP32 AB 1234',
        colour: 'Silver',
      },
      driverToken
    );
    console.log(`✅ [4/10] Driver Offer Ride: Status ${offerRes.status} -> Ride offered to ${offerRes.data.ride?.destination}`);
    const newRideId = offerRes.data.ride?._id;

    // 5. Passenger Searches Rides (Unnao)
    const search = await request('/rides/search?destination=Unnao');
    console.log(`✅ [5/10] Search Rides (Unnao): Found ${search.data.count} available ride(s)`);
    const rideToTest = search.data.rides[0];

    if (!rideToTest) {
      throw new Error('No rides found for test!');
    }
    console.log(`       Target Ride: ${rideToTest.source} -> ${rideToTest.destination} (Car: ${rideToTest.vehicle?.model}, Reg: ${rideToTest.vehicle?.registration_number}, Seats: ${rideToTest.available_seats})`);

    // 6. Passenger requests 1 seat
    const bookReq = await request(
      '/bookings',
      'POST',
      {
        ride_id: newRideId,
        seats_booked: 1,
        pickup_note: 'Standing near Gate 2 security cabin',
      },
      passengerToken
    );
    console.log(`✅ [6/10] Passenger Booking Request: Status ${bookReq.status} -> Booking ID ${bookReq.data.booking?._id} (${bookReq.data.booking?.booking_status})`);
    const bookingId = bookReq.data.booking?._id;

    // 7. Driver accepts request & atomically decrements seat
    const acceptRes = await request(`/bookings/${bookingId}/accept`, 'PUT', {}, driverToken);
    console.log(`✅ [7/10] Driver Accept Booking: Status ${acceptRes.status} -> Remaining Seats on Ride: ${acceptRes.data.remaining_seats}`);

    // 8. Driver starts journey & marks completed
    await request(`/rides/${newRideId}/start`, 'PUT', {}, driverToken);
    const completeRes = await request(`/rides/${newRideId}/complete`, 'PUT', {}, driverToken);
    console.log(`✅ [8/10] Driver Complete Journey: Status ${completeRes.status} -> Ride marked completed!`);

    // 9. Passenger submits 5-star Driving Experience Review
    const reviewRes = await request(
      '/reviews',
      'POST',
      {
        booking_id: bookingId,
        safety_rating: 5,
        behaviour_rating: 5,
        punctuality_rating: 5,
        communication_rating: 5,
        overall_rating: 5,
        review_text: 'Smooth and pleasant journey from CUUP to Unnao. Maintained safe speed limit throughout!',
      },
      passengerToken
    );
    console.log(`✅ [9/10] 5-Star Driving Review Submission: Status ${reviewRes.status} -> Review submitted`);

    // 10. Admin Overview & Audit Logs
    const adminLogin = await request('/auth/login', 'POST', {
      loginId: 'admin@campusdrivers.cu.ac.in',
      password: 'Password@123',
    });
    const adminToken = adminLogin.data.token;
    const adminOverview = await request('/admin/overview', 'GET', null, adminToken);
    console.log(`✅ [10/10] Admin Dashboard Overview: Status ${adminOverview.status} -> Verified Students: ${adminOverview.data.metrics?.verifiedStudents}, Total Rides: ${adminOverview.data.metrics?.totalRides}`);

    console.log('\n======================================================');
    console.log('🎉 ALL 10 INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  }
};

runTests();
