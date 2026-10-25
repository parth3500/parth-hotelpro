'use strict';

const assert = require('assert');
const http = require('http');

process.env.USE_MEMORY_DB = 'true';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'serverless_test_secret_2026';

const serverlessHandler = require('../api/index');
const { clearAllMemory, getConnectionType } = require('../server/config/db');

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  let data = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

let passed = 0;
let failed = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    failed++;
  }
}

async function runServerlessTests() {
  console.log('\n--- HotelPro Vercel Serverless Function Test Suite ---\n');

  clearAllMemory();

  // Create an HTTP server using the serverlessHandler exactly as Vercel's Node runtime does
  await new Promise(resolve => {
    server = http.createServer(async (req, res) => {
      try {
        await serverlessHandler(req, res);
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
    });

    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  // Test 1: Cold start / Boot in serverless mode
  await runTest('Serverless cold boot resolves with in-memory DB fallback', async () => {
    const res = await request('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'healthy');
    assert.strictEqual(res.data.service, 'HotelPro Management API');
    assert.strictEqual(getConnectionType(), 'memory');
  });

  // Test 2: Standard health endpoint
  await runTest('GET /health works through serverless handler', async () => {
    const res = await request('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'healthy');
  });

  // Test 3: Auto-seed verification - rooms catalog available
  await runTest('GET /api/rooms returns seeded room catalog', async () => {
    const res = await request('/api/rooms');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.rooms));
    assert.ok(res.data.rooms.length >= 6, `Expected at least 6 rooms, got ${res.data.rooms.length}`);
  });

  // Test 4: Auto-seed verification - admin login
  let adminToken;
  await runTest('POST /api/auth/login logs in seeded admin account', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@hotelpro.com',
        password: 'password123'
      }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.token, 'Token should be returned');
    assert.strictEqual(res.data.user.role, 'admin');
    adminToken = res.data.token;
  });

  // Test 5: Auto-seed verification - guest login
  let guestToken;
  await runTest('POST /api/auth/login logs in seeded guest account', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'guest@hotelpro.com',
        password: 'password123'
      }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.user.role, 'guest');
    guestToken = res.data.token;
  });

  // Test 6: Auto-seed verification - staff login
  await runTest('POST /api/auth/login logs in seeded staff account', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'staff@hotelpro.com',
        password: 'password123'
      }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.user.role, 'staff');
  });

  // Test 7: Seeded bookings access
  await runTest('GET /api/bookings with admin token returns seeded bookings', async () => {
    const res = await request('/api/bookings', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.bookings));
    assert.ok(res.data.bookings.length >= 2, `Expected at least 2 bookings, got ${res.data.bookings.length}`);
  });

  // Test 8: Submitting a new booking via serverless handler
  await runTest('POST /api/bookings creates a booking in serverless mode', async () => {
    const roomsRes = await request('/api/rooms');
    const availableRoom = roomsRes.data.rooms.find(r => r.roomNumber === '301');
    assert.ok(availableRoom, 'Room 301 should exist');

    const res = await request('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${guestToken}` },
      body: {
        roomId: availableRoom.id || availableRoom._id,
        checkInDate: '2026-11-10',
        checkOutDate: '2026-11-12',
        guestsCount: 2,
        specialRequests: 'High floor preferred'
      }
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.booking.bookingReference);
  });

  // Test 9: 404 handler in serverless mode
  await runTest('Unknown API route returns clean JSON 404', async () => {
    const res = await request('/api/non-existent-route-xyz');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.success, false);
  });

  // Cleanup
  server.close();

  console.log(`\n================================`);
  console.log(`Serverless tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runServerlessTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
