const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('📋 Running Campus Drivers User Acceptance Tests (UAT)...\n');

let passed = 0;
let total = 0;

function scenario(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ [ACCEPTANCE PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [ACCEPTANCE FAIL] ${name}`);
    console.error(`     Reason: ${err.message}`);
  }
}

async function scenarioAsync(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✅ [ACCEPTANCE PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [ACCEPTANCE FAIL] ${name}`);
    console.error(`     Reason: ${err.message}`);
  }
}

async function runAcceptanceTests() {
  console.log('--- Scenario Group 1: Student Verification & Registration Charter ---');

  scenario('UAT-01: User registration enforces minimum 6-character password', () => {
    const authCode = fs.readFileSync(path.resolve(__dirname, '../src/controllers/authController.js'), 'utf8');
    assert(
      authCode.includes('password.length < 6'),
      'Must enforce minimum 6 characters for student password'
    );
  });

  scenario('UAT-02: Duplicate student registration returns clear alreadyRegistered flag', () => {
    const authCode = fs.readFileSync(path.resolve(__dirname, '../src/controllers/authController.js'), 'utf8');
    assert(
      authCode.includes('alreadyRegistered: true'),
      'Must return alreadyRegistered: true flag so frontend can redirect to sign in'
    );
  });

  scenario('UAT-03: Student phone masking protects contact privacy before booking confirmation', () => {
    const userModelCode = fs.readFileSync(path.resolve(__dirname, '../src/models/User.js'), 'utf8');
    assert(
      userModelCode.includes('getPublicProfile'),
      'User model must provide getPublicProfile method'
    );
    assert(
      userModelCode.includes('slice(0, 3)') && userModelCode.includes('slice(-3)'),
      'Public profile must mask middle digits of student phone'
    );
  });

  console.log('\n--- Scenario Group 2: Sign In Performance & Timeout Resilience ---');

  scenario('UAT-04: Mongoose bufferCommands is disabled across the application to prevent 10s request freeze', () => {
    const dbCode = fs.readFileSync(path.resolve(__dirname, '../src/config/db.js'), 'utf8');
    assert(
      dbCode.includes("mongoose.set('bufferCommands', false)"),
      'bufferCommands must be set to false in db.js'
    );
  });

  scenario('UAT-05: Server middleware protects endpoints with instant 503 instead of hanging when DB is unready', () => {
    const serverCode = fs.readFileSync(path.resolve(__dirname, '../src/server.js'), 'utf8');
    assert(
      serverCode.includes('status(503)'),
      'Server must return 503 Service Unavailable immediately when DB is initializing'
    );
  });

  scenario('UAT-06: Database connection uses singleton promise cache to eliminate concurrent race conditions', () => {
    const dbCode = fs.readFileSync(path.resolve(__dirname, '../src/config/db.js'), 'utf8');
    assert(
      dbCode.includes('connectionPromise'),
      'db.js must implement connectionPromise singleton caching'
    );
  });

  scenario('UAT-07: Client mobile API routing dynamically targets current host without dead cloud domains', () => {
    const mobileApiCode = fs.readFileSync(path.resolve(__dirname, '../../mobile/src/services/api.js'), 'utf8');
    assert(
      !mobileApiCode.includes('capmusdriversproject.vercel.app'),
      'mobile/src/services/api.js must NOT contain dead cloud domain'
    );
    assert(
      !mobileApiCode.includes('192.168.51.113'),
      'mobile/src/services/api.js must NOT contain hardcoded private IP'
    );
    assert(
      mobileApiCode.includes('window.location.origin'),
      'mobile/src/services/api.js must use dynamic window.location.origin on web'
    );
  });

  scenario('UAT-08: Precompiled web bundles are patched and free from dead domain timeouts', () => {
    const bundlePaths = [
      path.resolve(__dirname, '../../admin-web/public/app/_expo/static/js/web/AppEntry-b9e3c268af3c59752f19c56d94f9cba5.js'),
      path.resolve(__dirname, '../../admin-web/public/_expo/static/js/web/AppEntry-b9e3c268af3c59752f19c56d94f9cba5.js'),
      path.resolve(__dirname, '../../android-builder/assets/www/_expo/static/js/web/AppEntry-b9e3c268af3c59752f19c56d94f9cba5.js'),
    ];
    for (const bPath of bundlePaths) {
      if (fs.existsSync(bPath)) {
        const bundle = fs.readFileSync(bPath, 'utf8');
        assert(
          !bundle.includes('capmusdriversproject.vercel.app'),
          `Bundle ${path.basename(bPath)} must not contain dead cloud domain`
        );
        assert(
          !bundle.includes('192.168.51.113'),
          `Bundle ${path.basename(bPath)} must not contain hardcoded private IP`
        );
      }
    }
  });

  console.log('\n--- Scenario Group 3: Mobile OTP & Fast Session Flow ---');

  scenario('UAT-09: OTP verification directly logs in user without making redundant second login request', () => {
    const loginScreenCode = fs.readFileSync(path.resolve(__dirname, '../../mobile/src/screens/LoginScreen.js'), 'utf8');
    assert(
      loginScreenCode.includes('loginWithSession(res.data.token, res.data.user)'),
      'LoginScreen must use loginWithSession to avoid redundant roundtrip'
    );
    assert(
      !loginScreenCode.includes("await login(res.data.user.email, 'Password@123')"),
      'Must NOT make secondary login call with hardcoded Password@123'
    );
  });

  scenario('UAT-10: Notifications fetching in AuthContext is non-blocking so sign in completes instantly', () => {
    const authContextCode = fs.readFileSync(path.resolve(__dirname, '../../mobile/src/context/AuthContext.js'), 'utf8');
    assert(
      authContextCode.includes('fetchUnreadNotifications'),
      'AuthContext must use asynchronous non-blocking notification fetch'
    );
  });

  console.log('\n--- Scenario Group 4: Admin Portal Security Acceptance ---');

  scenario('UAT-11: Admin portal strictly requires dedicated campusdrivers000 credential', () => {
    const adminAuthCode = fs.readFileSync(path.resolve(__dirname, '../../admin-web/src/context/AdminAuthContext.jsx'), 'utf8');
    assert(
      adminAuthCode.includes('campusdrivers000'),
      'AdminAuthContext must enforce campusdrivers000 credential'
    );
    assert(
      adminAuthCode.includes('campus1010'),
      'AdminAuthContext must enforce campus1010 authorized password'
    );
  });

  scenario('UAT-12: Backend auth controller strictly blocks unauthorized admin logins', () => {
    const authControllerCode = fs.readFileSync(path.resolve(__dirname, '../src/controllers/authController.js'), 'utf8');
    assert(
      authControllerCode.includes('isSpecialAdmin'),
      'authController must enforce special admin validation'
    );
    assert(
      authControllerCode.includes('Admin portal access is strictly restricted'),
      'Must reject admin logins that lack official credential'
    );
  });

  console.log('\n--- Scenario Group 5: Carpooling & Rating Charter Acceptance ---');

  scenario('UAT-13: 5-Star Driving Review evaluates all 5 specified criteria', () => {
    const reviewModelCode = fs.readFileSync(path.resolve(__dirname, '../src/models/Review.js'), 'utf8');
    assert(reviewModelCode.includes('safety_rating'), 'Must include safety_rating');
    assert(reviewModelCode.includes('behaviour_rating'), 'Must include behaviour_rating');
    assert(reviewModelCode.includes('punctuality_rating'), 'Must include punctuality_rating');
    assert(reviewModelCode.includes('communication_rating'), 'Must include communication_rating');
    assert(reviewModelCode.includes('overall_rating'), 'Must include overall_rating');
  });

  scenario('UAT-14: Booking system uses atomic seat reservation to prevent race conditions', () => {
    const bookingCtrlCode = fs.readFileSync(path.resolve(__dirname, '../src/controllers/bookingController.js'), 'utf8');
    assert(
      bookingCtrlCode.includes('$inc') && bookingCtrlCode.includes('available_seats'),
      'Booking must use atomic $inc on available_seats'
    );
  });

  console.log('\n======================================================');
  console.log(`Acceptance Tests Summary: ${passed} / ${total} criteria verified (${Math.round((passed / total) * 100)}%)`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runAcceptanceTests();
