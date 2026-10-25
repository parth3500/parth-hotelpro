// Comprehensive Backend Test Suite for HotelPro
process.env.USE_MEMORY_DB = 'true';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_jwt_key_2026';
process.env.JWT_EXPIRE = '2d';

const assert = require('assert');
const app = require('../server/server');
const { connectDB, clearAllMemory } = require('../server/config/db');

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

async function test(name, fn) {
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

async function runTests() {
  console.log('\n--- HotelPro Backend Route & Middleware Test Suite ---\n');

  await connectDB();
  clearAllMemory();

  await new Promise(resolve => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  // Global test tokens
  let guestToken = '';
  let guestUser = null;
  let guestTokenB = '';
  let guestUserB = null;
  let staffToken = '';
  let adminToken = '';
  let testRoomId = '';
  let testBookingId = '';
  let testBookingIdB = '';

  // 1. Health check
  await test('GET /health returns healthy status', async () => {
    const res = await request('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'healthy');
  });

  // 2. Auth tests
  await test('POST /register registers a guest user and returns token', async () => {
    const res = await request('/register', {
      method: 'POST',
      body: {
        name: 'Alice Guest',
        email: 'alice@example.com',
        password: 'password123',
        phone: '1234567890'
      }
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.token);
    assert.strictEqual(res.data.user.email, 'alice@example.com');
    assert.strictEqual(res.data.user.role, 'guest');
    assert.strictEqual(res.data.user.password, undefined); // password must NOT be exposed
    guestToken = res.data.token;
    guestUser = res.data.user;
  });

  await test('POST /register rejects duplicate email address with 400', async () => {
    const res = await request('/register', {
      method: 'POST',
      body: {
        name: 'Alice Duplicate',
        email: 'alice@example.com',
        password: 'password123'
      }
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  await test('POST /register validates password minimum length', async () => {
    const res = await request('/register', {
      method: 'POST',
      body: {
        name: 'Short Pass',
        email: 'short@example.com',
        password: '123'
      }
    });
    assert.strictEqual(res.status, 400);
  });

  await test('Register second guest for IDOR testing', async () => {
    const res = await request('/register', {
      method: 'POST',
      body: {
        name: 'Bob Guest',
        email: 'bob@example.com',
        password: 'password123'
      }
    });
    assert.strictEqual(res.status, 201);
    guestTokenB = res.data.token;
    guestUserB = res.data.user;
  });

  await test('Register staff and admin accounts', async () => {
    const staffRes = await request('/register', {
      method: 'POST',
      body: {
        name: 'Sam Staff',
        email: 'staff@example.com',
        password: 'password123',
        role: 'staff'
      }
    });
    assert.strictEqual(staffRes.status, 201);
    staffToken = staffRes.data.token;

    const adminRes = await request('/register', {
      method: 'POST',
      body: {
        name: 'Adam Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      }
    });
    assert.strictEqual(adminRes.status, 201);
    adminToken = adminRes.data.token;
  });

  await test('POST /login logs in successfully with valid credentials', async () => {
    const res = await request('/login', {
      method: 'POST',
      body: {
        email: 'alice@example.com',
        password: 'password123'
      }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token);
  });

  await test('POST /login rejects invalid password with 401', async () => {
    const res = await request('/login', {
      method: 'POST',
      body: {
        email: 'alice@example.com',
        password: 'wrongpassword'
      }
    });
    assert.strictEqual(res.status, 401);
  });

  await test('GET /profile returns authenticated user profile', async () => {
    const res = await request('/profile', {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.email, 'alice@example.com');
  });

  await test('GET /profile without token returns 401', async () => {
    const res = await request('/profile');
    assert.strictEqual(res.status, 401);
  });

  await test('PUT /profile updates profile fields', async () => {
    const res = await request('/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${guestToken}` },
      body: { phone: '9998887777', name: 'Alice Updated' }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.phone, '9998887777');
    assert.strictEqual(res.data.user.name, 'Alice Updated');
  });

  await test('POST /logout returns success', async () => {
    const res = await request('/logout', { method: 'POST' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  // 3. Room tests
  await test('POST /rooms fails for guest (RBAC forbidden 403)', async () => {
    const res = await request('/rooms', {
      method: 'POST',
      headers: { Authorization: `Bearer ${guestToken}` },
      body: { roomNumber: '101', category: 'Standard', pricePerNight: 120 }
    });
    assert.strictEqual(res.status, 403);
  });

  await test('POST /rooms succeeds for admin', async () => {
    const res = await request('/rooms', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        roomNumber: '101',
        category: 'Deluxe',
        pricePerNight: 150,
        capacity: 2,
        amenities: ['Wi-Fi', 'TV', 'Ocean View']
      }
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.room.roomNumber, '101');
    testRoomId = res.data.room._id || res.data.room.id;

    // Create a second room
    const res2 = await request('/rooms', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        roomNumber: '102',
        category: 'Suite',
        pricePerNight: 280,
        capacity: 4
      }
    });
    assert.strictEqual(res2.status, 201);
  });

  await test('GET /rooms returns list of rooms', async () => {
    const res = await request('/rooms');
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.rooms.length >= 2);
  });

  await test('GET /rooms/:id returns single room details', async () => {
    const res = await request(`/rooms/${testRoomId}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.room.roomNumber, '101');
  });

  await test('PUT /rooms/:id updates room details (Admin only)', async () => {
    const res = await request(`/rooms/${testRoomId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { pricePerNight: 160 }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.room.pricePerNight, 160);
  });

  // 4. Booking tests & Double-Booking Prevention
  await test('POST /bookings creates a confirmed reservation', async () => {
    const res = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${guestToken}` },
      body: {
        roomId: testRoomId,
        checkInDate: '2026-11-01',
        checkOutDate: '2026-11-05',
        guestsCount: 2
      }
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.booking.roomNumber, '101');
    assert.strictEqual(res.data.booking.totalNights, 4);
    assert.strictEqual(res.data.booking.totalAmount, 4 * 160);
    testBookingId = res.data.booking._id || res.data.booking.id;
  });

  await test('Double-booking prevention: overlapping dates rejected with 409 Conflict', async () => {
    // Attempt overlap: 2026-11-03 to 2026-11-07 (overlaps Nov 1 - Nov 5)
    const res = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${guestTokenB}` },
      body: {
        roomId: testRoomId,
        checkInDate: '2026-11-03',
        checkOutDate: '2026-11-07',
        guestsCount: 1
      }
    });
    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.data.success, false);
  });

  await test('Double-booking check: non-overlapping adjacent dates succeed', async () => {
    // Non-overlapping checkIn equal to previous checkOut: 2026-11-05 to 2026-11-08
    const res = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${guestTokenB}` },
      body: {
        roomId: testRoomId,
        checkInDate: '2026-11-05',
        checkOutDate: '2026-11-08',
        guestsCount: 1
      }
    });
    assert.strictEqual(res.status, 201);
    testBookingIdB = res.data.booking._id || res.data.booking.id;
  });

  await test('GET /rooms/available excludes booked room for overlapping range', async () => {
    const res = await request('/rooms/available?checkInDate=2026-11-02&checkOutDate=2026-11-04');
    assert.strictEqual(res.status, 200);
    // Room 101 must NOT be in available rooms
    const found101 = res.data.rooms.some(r => r.roomNumber === '101');
    assert.strictEqual(found101, false);
    // Room 102 must be available
    const found102 = res.data.rooms.some(r => r.roomNumber === '102');
    assert.strictEqual(found102, true);
  });

  // 5. IDOR Guards on Bookings
  await test('IDOR Guard: guest A cannot view guest B booking via GET /bookings/:id (403)', async () => {
    const res = await request(`/bookings/${testBookingIdB}`, {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(res.status, 403);
  });

  await test('IDOR Guard: guest A cannot cancel guest B booking via PUT /bookings/:id/cancel (403)', async () => {
    const res = await request(`/bookings/${testBookingIdB}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${guestToken}` },
      body: { reason: 'Malicious cancel attempt' }
    });
    assert.strictEqual(res.status, 403);
  });

  await test('Guest A can view their own booking', async () => {
    const res = await request(`/bookings/${testBookingId}`, {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.booking.roomNumber, '101');
  });

  await test('GET /bookings returns only own bookings for guest', async () => {
    const res = await request('/bookings', {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(res.status, 200);
    for (const b of res.data.bookings) {
      assert.strictEqual(b.userId.toString(), guestUser.id.toString());
    }
  });

  await test('GET /bookings returns all bookings for admin', async () => {
    const res = await request('/bookings', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.bookings.length >= 2);
  });

  // 6. Payment routes & IDOR guards
  await test('IDOR Guard: guest B cannot pay for guest A booking (403)', async () => {
    const res = await request('/payments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${guestTokenB}` },
      body: { bookingId: testBookingId, paymentMethod: 'card' }
    });
    assert.strictEqual(res.status, 403);
  });

  await test('POST /payments succeeds for booking owner', async () => {
    const res = await request('/payments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${guestToken}` },
      body: {
        bookingId: testBookingId,
        paymentMethod: 'card',
        cardDetails: { number: '4242424242424242' }
      }
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.payment.status, 'success');
  });

  await test('Double payment prevention: paying for already paid booking returns 400', async () => {
    const res = await request('/payments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${guestToken}` },
      body: { bookingId: testBookingId }
    });
    assert.strictEqual(res.status, 400);
  });

  await test('GET /payments/:bookingId returns payment details to owner', async () => {
    const res = await request(`/payments/${testBookingId}`, {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.payment.bookingId, testBookingId);
  });

  await test('IDOR Guard: guest B cannot view guest A payment (403)', async () => {
    const res = await request(`/payments/${testBookingId}`, {
      headers: { Authorization: `Bearer ${guestTokenB}` }
    });
    assert.strictEqual(res.status, 403);
  });

  await test('GET /payments (Admin) returns all payments', async () => {
    const res = await request('/payments', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.payments.length >= 1);
  });

  // 7. Check-in and Check-out workflows
  await test('POST /bookings/:id/checkin marks guest checked in and room occupied (Staff only)', async () => {
    const res = await request(`/bookings/${testBookingId}/checkin`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.booking.status, 'checked_in');

    // Check room status is occupied
    const roomRes = await request(`/rooms/${testRoomId}`);
    assert.strictEqual(roomRes.data.room.status, 'occupied');
  });

  await test('POST /bookings/:id/checkout marks guest checked out and room cleaning (Staff only)', async () => {
    const res = await request(`/bookings/${testBookingId}/checkout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.booking.status, 'checked_out');

    // Check room status is cleaning
    const roomRes = await request(`/rooms/${testRoomId}`);
    assert.strictEqual(roomRes.data.room.status, 'cleaning');
  });

  // 8. Cancellation workflow
  await test('PUT /bookings/:id/cancel cancels booking with refund calculation', async () => {
    const res = await request(`/bookings/${testBookingIdB}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${guestTokenB}` },
      body: { reason: 'Change of plans' }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.booking.status, 'cancelled');
  });

  // 9. Review routes
  await test('POST /reviews submits review and GET /reviews/room/:roomId computes average', async () => {
    const postRes = await request('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${guestToken}` },
      body: {
        roomId: testRoomId,
        rating: 5,
        comment: 'Fantastic stay and excellent service!'
      }
    });
    assert.strictEqual(postRes.status, 201);
    const reviewId = postRes.data.review._id || postRes.data.review.id;

    // Second review
    await request('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${guestTokenB}` },
      body: {
        roomId: testRoomId,
        rating: 3,
        comment: 'Average room'
      }
    });

    const getRes = await request(`/reviews/room/${testRoomId}`);
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.data.count, 2);
    assert.strictEqual(getRes.data.averageRating, 4.0);

    // Staff response
    const staffRes = await request(`/reviews/${reviewId}/response`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: { staffResponse: 'Thank you for your generous feedback!' }
    });
    assert.strictEqual(staffRes.status, 200);
    assert.strictEqual(staffRes.data.review.staffResponse, 'Thank you for your generous feedback!');
  });

  // 10. Notification routes
  await test('GET /notifications returns user notifications and PUT /notifications/:id/read updates status', async () => {
    const res = await request('/notifications', {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.notifications.length > 0);

    const notifId = res.data.notifications[0]._id || res.data.notifications[0].id;

    // IDOR check: guest B cannot mark guest A notification read
    const idorRes = await request(`/notifications/${notifId}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${guestTokenB}` }
    });
    assert.strictEqual(idorRes.status, 403);

    // Owner marks read
    const readRes = await request(`/notifications/${notifId}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(readRes.status, 200);
    assert.strictEqual(readRes.data.notification.read, true);
  });

  // 11. Service routes
  await test('POST /services creates service ticket and Staff updates it', async () => {
    const postRes = await request('/services', {
      method: 'POST',
      headers: { Authorization: `Bearer ${guestToken}` },
      body: {
        roomNumber: '101',
        type: 'towels',
        details: 'Extra fresh towels requested',
        priority: 'medium'
      }
    });
    assert.strictEqual(postRes.status, 201);
    const serviceId = postRes.data.serviceRequest._id || postRes.data.serviceRequest.id;

    // Staff updates status to completed
    const putRes = await request(`/services/${serviceId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: { status: 'completed', assignedStaffName: 'Housekeeper Maria' }
    });
    assert.strictEqual(putRes.status, 200);
    assert.strictEqual(putRes.data.serviceRequest.status, 'completed');
  });

  // 12. Staff routes
  await test('Staff routes: dashboard, status update, checkins log', async () => {
    // Guest cannot access staff dashboard
    const guestDeny = await request('/staff/dashboard', {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(guestDeny.status, 403);

    // Staff access dashboard
    const dashRes = await request('/staff/dashboard', {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert.strictEqual(dashRes.status, 200);
    assert.ok(dashRes.data.dashboard.rooms);

    // Staff updates room status back to available
    const statusRes = await request(`/staff/room/${testRoomId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: { status: 'available' }
    });
    assert.strictEqual(statusRes.status, 200);
    assert.strictEqual(statusRes.data.room.status, 'available');

    // Staff views check-in logs
    const checkinRes = await request('/staff/checkins', {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert.strictEqual(checkinRes.status, 200);
    assert.ok(checkinRes.data.checkins.length >= 2);
  });

  // 13. Admin routes
  await test('Admin routes: list users, hotels, reports, update user status', async () => {
    // Guest cannot access admin routes
    const guestDeny = await request('/admin/users', {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(guestDeny.status, 403);

    // Admin views users
    const usersRes = await request('/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(usersRes.status, 200);
    assert.ok(usersRes.data.users.length >= 3);

    // Admin views hotels
    const hotelsRes = await request('/admin/hotels', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(hotelsRes.status, 200);
    assert.ok(hotelsRes.data.hotels.length >= 1);

    // Admin views reports
    const reportsRes = await request('/admin/reports', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(reportsRes.status, 200);
    assert.ok(reportsRes.data.summary.totalRevenue >= 0);

    // Admin suspends guest B
    const suspendRes = await request(`/admin/users/${guestUserB.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'suspended' }
    });
    assert.strictEqual(suspendRes.status, 200);
    assert.strictEqual(suspendRes.data.user.status, 'suspended');

    // Suspended user cannot login
    const loginRes = await request('/login', {
      method: 'POST',
      body: { email: 'bob@example.com', password: 'password123' }
    });
    assert.strictEqual(loginRes.status, 403);
  });

  // 14. 404 and Error Handler tests
  await test('Unknown route returns 404 JSON', async () => {
    const res = await request('/unknown-endpoint-random');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.success, false);
  });

  // Close server
  await new Promise(resolve => server.close(resolve));

  console.log(`\n================================`);
  console.log(`Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
