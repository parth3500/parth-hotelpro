const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Room = require('../src/models/Room');
const Booking = require('../src/models/Booking');
const Payment = require('../src/models/Payment');
const connectDB = require('../src/config/db');
const jwt = require('jsonwebtoken');

describe('HotelPro Integration API Tests', () => {
  let adminToken;
  let customerToken;
  let customerId;
  let roomId;
  let bookingId;

  beforeAll(async () => {
    await connectDB();
    // Clean up DB collections
    await User.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hotelpro.com',
      password: 'password123',
      role: 'admin',
    });
    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'hotelpro_super_secret_key_2026');

    // Create customer user
    const customer = await User.create({
      name: 'Customer User',
      email: 'customer@hotelpro.com',
      password: 'password123',
      role: 'customer',
    });
    customerId = customer._id;
    customerToken = jwt.sign({ id: customer._id }, process.env.JWT_SECRET || 'hotelpro_super_secret_key_2026');
  }, 30000);

  afterAll(async () => {
    // Clean up DB
    await User.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
  }, 30000);

  describe('Auth Endpoints (/api/auth)', () => {
    test('POST /api/auth/register - success', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New Registered',
          email: 'newreg@hotelpro.com',
          password: 'password123',
          role: 'customer',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    test('POST /api/auth/login - success', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer@hotelpro.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    test('GET /api/auth/me - success with token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('customer@hotelpro.com');
    });

    test('GET /api/auth/me - unauthorized without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Room Endpoints (/api/rooms)', () => {
    test('POST /api/rooms - admin can create room', async () => {
      const res = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roomNumber: '305',
          type: 'suite',
          pricePerNight: 200,
          capacity: 2,
          amenities: ['WiFi', 'AC'],
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      roomId = res.body.data._id;
    });

    test('GET /api/rooms - public can list rooms', async () => {
      const res = await request(app).get('/api/rooms');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });

    test('GET /api/rooms/:id - get specific room', async () => {
      const res = await request(app).get(`/api/rooms/${roomId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roomNumber).toBe('305');
    });
  });

  describe('Booking Endpoints (/api/bookings)', () => {
    test('POST /api/bookings - customer can create booking', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          room: roomId,
          checkIn: '2026-07-01',
          checkOut: '2026-07-05',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      bookingId = res.body.data._id;
      expect(res.body.data.totalPrice).toBe(800); // 4 nights * 200
    });

    test('GET /api/bookings/my - customer can view own bookings', async () => {
      const res = await request(app)
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });
  });

  describe('Payment Endpoints (/api/payments)', () => {
    test('POST /api/payments - process payment for booking', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          bookingId: bookingId,
          amount: 800,
          paymentMethod: 'demo',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('success');
    });

    test('GET /api/payments/booking/:bookingId - get payment info', async () => {
      const res = await request(app)
        .get(`/api/payments/booking/${bookingId}`)
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(800);
    });
  });
});
