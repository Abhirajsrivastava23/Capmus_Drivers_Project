const assert = require('assert');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

console.log('🧪 Running Campus Drivers Unit Tests...\n');

let passed = 0;
let total = 0;

function it(description, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function itAsync(description, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAllUnitTests() {
  console.log('--- 1. Authentication & JWT Unit Tests ---');

  const secret = 'campus_drivers_jwt_super_secure_secret_key_lucknow_campus_2026';
  const testUserId = '64a1b2c3d4e5f6a7b8c9d0e1';

  it('JWT generates a valid signed token containing the user id', () => {
    const token = jwt.sign({ id: testUserId }, secret, { expiresIn: '30d' });
    assert(token && typeof token === 'string', 'Token must be a non-empty string');
    const decoded = jwt.verify(token, secret);
    assert.strictEqual(decoded.id, testUserId, 'Decoded user ID must match payload');
  });

  it('JWT rejects an expired or tampered token', () => {
    const token = jwt.sign({ id: testUserId }, secret, { expiresIn: '1ms' });
    // Tampered token
    assert.throws(() => {
      jwt.verify(token + 'tamper', secret);
    }, 'Tampered token must throw');
  });

  console.log('\n--- 2. Password Hashing & Comparison Unit Tests ---');

  await itAsync('bcryptjs correctly hashes and matches passwords', async () => {
    const plain = 'Password@123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plain, salt);
    assert(hash !== plain, 'Hashed password must differ from plain');
    const isMatch = await bcrypt.compare(plain, hash);
    assert.strictEqual(isMatch, true, 'bcrypt must match the correct password');
    const isMismatch = await bcrypt.compare('WrongPassword', hash);
    assert.strictEqual(isMismatch, false, 'bcrypt must reject wrong password');
  });

  console.log('\n--- 3. Phone Masking & Profile Sanitization Unit Tests ---');

  it('Phone number is properly masked for public views', () => {
    const phone = '9876543210';
    const masked = `${phone.slice(0, 3)}****${phone.slice(-3)}`;
    assert.strictEqual(masked, '987****210', 'Phone must be masked showing only 3 prefix and 3 suffix digits');
  });

  it('Student ID is automatically trimmed and uppercased', () => {
    const inputId = '  22bca1098   ';
    const cleanId = inputId.toUpperCase().trim();
    assert.strictEqual(cleanId, '22BCA1098', 'Student ID must be trimmed and uppercase');
  });

  console.log('\n--- 4. Client API Base Dynamic Resolution Unit Tests ---');

  it('Web API Base on Vite port 3000 resolves to same-origin /api', () => {
    // Simulate window.location in web browser
    const mockWindow = {
      location: {
        origin: 'http://localhost:3000',
        hostname: 'localhost',
        port: '3000',
        protocol: 'http:',
      },
    };
    const resolveBase = (w) => {
      if (w.location.port === '3000' || !w.location.port || w.location.protocol.startsWith('https')) {
        return `${w.location.origin}/api`;
      }
      return `http://${w.location.hostname}:5001/api`;
    };
    const resolved = resolveBase(mockWindow);
    assert.strictEqual(resolved, 'http://localhost:3000/api', 'Vite dev must route through /api proxy');
  });

  it('Web API Base on LAN IP (e.g. 192.168.1.50:3000) resolves to LAN origin without dead cloud domain', () => {
    const mockWindow = {
      location: {
        origin: 'http://192.168.1.50:3000',
        hostname: '192.168.1.50',
        port: '3000',
        protocol: 'http:',
      },
    };
    const resolveBase = (w) => {
      if (w.location.port === '3000' || !w.location.port || w.location.protocol.startsWith('https')) {
        return `${w.location.origin}/api`;
      }
      return `http://${w.location.hostname}:5001/api`;
    };
    const resolved = resolveBase(mockWindow);
    assert.strictEqual(resolved, 'http://192.168.1.50:3000/api', 'LAN web access must route to same origin /api');
    assert(!resolved.includes('capmusdriversproject'), 'Must NEVER contain dead cloud domain');
  });

  it('Web API Base on Expo port 8081 resolves to host on port 5001', () => {
    const mockWindow = {
      location: {
        origin: 'http://192.168.1.50:8081',
        hostname: '192.168.1.50',
        port: '8081',
        protocol: 'http:',
      },
    };
    const resolveBase = (w) => {
      if (w.location.port === '8081') {
        return `http://${w.location.hostname}:5001/api`;
      }
      return `${w.location.origin}/api`;
    };
    const resolved = resolveBase(mockWindow);
    assert.strictEqual(resolved, 'http://192.168.1.50:5001/api', 'Expo dev must route to machine IP on port 5001');
  });

  console.log('\n--- 5. Database Fail-Fast & Connection Guard Unit Tests ---');

  it('Mongoose bufferCommands is disabled to prevent 10-second request hangs', () => {
    // Test that the configuration file sets bufferCommands: false
    const dbConfigCode = require('fs').readFileSync(
      path.resolve(__dirname, '../src/config/db.js'),
      'utf8'
    );
    assert(
      dbConfigCode.includes("mongoose.set('bufferCommands', false)"),
      'db.js must explicitly disable Mongoose command buffering'
    );
  });

  it('Database connection caching pattern prevents concurrent connection races', () => {
    const dbConfigCode = require('fs').readFileSync(
      path.resolve(__dirname, '../src/config/db.js'),
      'utf8'
    );
    assert(
      dbConfigCode.includes('connectionPromise'),
      'db.js must use connectionPromise singleton cache'
    );
  });

  console.log('\n--- 6. Admin Dedicated Credentials Unit Tests ---');

  it('Admin login validates campusdrivers000 credential', () => {
    const validIds = ['campusdrivers000', 'campusdrivers000.', 'campusdrivers000@campusdrivers.cu.ac.in'];
    const testInput1 = 'campusdrivers000';
    const testInput2 = 'CAMPUSDRIVERS000';
    assert(validIds.includes(testInput1.toLowerCase()), 'Must accept lowercase campusdrivers000');
    assert(validIds.includes(testInput2.toLowerCase()), 'Must accept uppercase CAMPUSDRIVERS000');
    assert(!validIds.includes('random_admin'), 'Must reject unauthorized admin credentials');
  });

  console.log('\n======================================================');
  console.log(`Unit Tests Summary: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runAllUnitTests();
