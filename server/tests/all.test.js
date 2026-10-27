const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { generateToken, protect, isAdmin } = require('../src/middleware/auth');
const User = require('../src/models/User');
const Room = require('../src/models/Room');
const Booking = require('../src/models/Booking');
const Payment = require('../src/models/Payment');
const { register, login, getMe } = require('../src/controllers/authController');
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../src/controllers/roomController');
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
} = require('../src/controllers/bookingController');
const {
  createPayment,
  getPaymentByBooking,
} = require('../src/controllers/paymentController');

describe('HotelPro Backend Comprehensive Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('User Model & Auth Middleware', () => {
    test('JWT token generation and verification', () => {
      const token = generateToken('1234567890abcdef');
      expect(token).toBeDefined();
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hotelpro_super_secret_key_2026');
      expect(decoded.id).toBe('1234567890abcdef');
    });

    test('User comparePassword method', async () => {
      const password = 'mypassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: hashedPassword,
      });

      const match = await user.comparePassword(password);
      expect(match).toBe(true);

      const noMatch = await user.comparePassword('wrongpassword');
      expect(noMatch).toBe(false);
    });

    test('Auth middleware protect success and error handling', async () => {
      const req = {
        headers: {
          authorization: `Bearer ${generateToken('user123')}`,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      jest.spyOn(User, 'findById').mockResolvedValueOnce({
        _id: 'user123',
        name: 'Test User',
        role: 'customer',
      });

      await protect(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user.role).toBe('customer');

      // Test without authorization header
      const reqNoAuth = { headers: {} };
      const resNoAuth = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      await protect(reqNoAuth, resNoAuth, next);
      expect(resNoAuth.status).toHaveBeenCalledWith(401);
    });

    test('Auth middleware isAdmin authorization', () => {
      const adminReq = { user: { role: 'admin' } };
      const customerReq = { user: { role: 'customer' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      isAdmin(adminReq, res, next);
      expect(next).toHaveBeenCalled();

      isAdmin(customerReq, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Models Validation and Price Snapshot', () => {
    test('Room model schema properties and defaults', () => {
      const room = new Room({
        roomNumber: '101',
        type: 'double',
        pricePerNight: 150,
        capacity: 2,
        amenities: ['WiFi', 'TV'],
      });

      expect(room.roomNumber).toBe('101');
      expect(room.pricePerNight).toBe(150);
      expect(room.isAvailable).toBe(true);
    });

    test('Booking date overlap condition logic', () => {
      // Overlap condition logic test:
      // checkInA < checkOutB && checkOutA > checkInB
      const isOverlapping = (startA, endA, startB, endB) => {
        return new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB);
      };

      const bookingA = { checkIn: '2026-06-01', checkOut: '2026-06-05' };

      // Overlapping booking
      expect(isOverlapping('2026-06-03', '2026-06-07', bookingA.checkIn, bookingA.checkOut)).toBe(true);
      // Non-overlapping booking after
      expect(isOverlapping('2026-06-05', '2026-06-10', bookingA.checkIn, bookingA.checkOut)).toBe(false);
      // Non-overlapping booking before
      expect(isOverlapping('2026-05-25', '2026-06-01', bookingA.checkIn, bookingA.checkOut)).toBe(false);
    });

    test('Booking price calculation logic', () => {
      const pricePerNight = 120;
      const checkIn = new Date('2026-06-01');
      const checkOut = new Date('2026-06-05');
      const diffTime = Math.abs(checkOut - checkIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const totalPrice = diffDays * pricePerNight;

      expect(diffDays).toBe(4);
      expect(totalPrice).toBe(480);
    });

    test('Payment model defaults and transaction ID', () => {
      const payment = new Payment({
        booking: '507f1f77bcf86cd799439011',
        user: '507f1f77bcf86cd799439012',
        amount: 300,
      });

      expect(payment.status).toBe('success');
      expect(payment.transactionId).toBeDefined();
      expect(payment.paymentMethod).toBe('demo');
    });
  });

  describe('Auth Controller', () => {
    test('register creates a new user and returns token', async () => {
      const req = {
        body: {
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
          role: 'customer',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(User, 'create').mockResolvedValueOnce({
        _id: '507f1f77bcf86cd799439011',
        name: 'New User',
        email: 'new@example.com',
        role: 'customer',
      });

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          token: expect.any(String),
          user: expect.objectContaining({
            email: 'new@example.com',
          }),
        })
      );
    });

    test('login authenticates user and returns token', async () => {
      const req = {
        body: {
          email: 'user@example.com',
          password: 'password123',
        },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'User',
        email: 'user@example.com',
        role: 'customer',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, 'findOne').mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(mockUser),
      });

      await login(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          token: expect.any(String),
        })
      );
    });

    test('getMe returns currently authenticated user', async () => {
      const req = { user: { _id: '507f1f77bcf86cd799439011' } };
      const res = { json: jest.fn() };
      const next = jest.fn();

      jest.spyOn(User, 'findById').mockResolvedValueOnce({
        _id: '507f1f77bcf86cd799439011',
        name: 'Logged In User',
        email: 'logged@example.com',
        role: 'customer',
      });

      await getMe(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'Logged In User',
          email: 'logged@example.com',
          role: 'customer',
        },
      });
    });
  });

  describe('Room Controller', () => {
    test('getRooms returns list of rooms', async () => {
      const req = { query: {} };
      const res = { json: jest.fn() };
      const next = jest.fn();

      jest.spyOn(Room, 'find').mockResolvedValueOnce([
        { _id: '1', roomNumber: '101', type: 'single' },
        { _id: '2', roomNumber: '102', type: 'double' },
      ]);

      await getRooms(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: expect.any(Array),
      });
    });

    test('getRoomById returns single room', async () => {
      const req = { params: { id: 'room123' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      const next = jest.fn();

      jest.spyOn(Room, 'findById').mockResolvedValueOnce({
        _id: 'room123',
        roomNumber: '101',
      });

      await getRoomById(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { _id: 'room123', roomNumber: '101' },
      });
    });

    test('createRoom creates a new room', async () => {
      const req = {
        body: {
          roomNumber: '201',
          type: 'suite',
          pricePerNight: 250,
          capacity: 3,
        },
      };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      const next = jest.fn();

      jest.spyOn(Room, 'create').mockResolvedValueOnce({
        _id: 'room201',
        roomNumber: '201',
        type: 'suite',
        pricePerNight: 250,
      });

      await createRoom(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ roomNumber: '201' }),
        })
      );
    });

    test('deleteRoom deletes a room', async () => {
      const mockRoom = {
        _id: 'roomToDelete',
        deleteOne: jest.fn().mockResolvedValueOnce({}),
      };
      const req = { params: { id: 'roomToDelete' } };
      const res = { json: jest.fn() };
      const next = jest.fn();

      jest.spyOn(Room, 'findById').mockResolvedValueOnce(mockRoom);

      await deleteRoom(req, res, next);

      expect(mockRoom.deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, data: {} });
    });
  });

  describe('Booking Controller', () => {
    test('getMyBookings returns user bookings', async () => {
      const req = { user: { _id: 'user123' } };
      const res = { json: jest.fn() };
      const next = jest.fn();

      const mockFind = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValueOnce([
          { _id: 'b1', user: 'user123', totalPrice: 300 },
        ]),
      };
      jest.spyOn(Booking, 'find').mockReturnValueOnce(mockFind);

      await getMyBookings(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: expect.any(Array),
      });
    });

    test('cancelBooking marks booking as cancelled', async () => {
      const mockBooking = {
        _id: 'b1',
        user: 'user123',
        status: 'confirmed',
        save: jest.fn().mockResolvedValueOnce(true),
      };
      const req = {
        params: { id: 'b1' },
        user: { _id: 'user123', role: 'customer' },
      };
      const res = { json: jest.fn() };
      const next = jest.fn();

      jest.spyOn(Booking, 'findById').mockResolvedValueOnce(mockBooking);

      await cancelBooking(req, res, next);

      expect(mockBooking.status).toBe('cancelled');
      expect(mockBooking.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockBooking,
      });
    });
  });

  describe('Payment Controller', () => {
    test('createPayment processes demo payment and updates booking status', async () => {
      const mockBooking = {
        _id: 'booking123',
        user: 'user123',
        totalPrice: 450,
        paymentStatus: 'pending',
        save: jest.fn().mockResolvedValueOnce(true),
      };

      const req = {
        body: { bookingId: 'booking123', amount: 450, paymentMethod: 'demo' },
        user: { _id: 'user123', role: 'customer' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      jest.spyOn(Booking, 'findById').mockResolvedValueOnce(mockBooking);
      jest.spyOn(Payment, 'create').mockResolvedValueOnce({
        _id: 'pay123',
        booking: 'booking123',
        amount: 450,
        status: 'success',
        transactionId: 'txn_test_123',
      });

      await createPayment(req, res, next);

      expect(mockBooking.paymentStatus).toBe('paid');
      expect(mockBooking.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Payment processed successfully (Demo Mode)',
        })
      );
    });

    test('getPaymentByBooking retrieves payment details', async () => {
      const mockPopulated = {
        _id: 'pay123',
        amount: 450,
        user: { _id: 'user123' },
      };
      const mockFindOne = {
        populate: jest.fn().mockReturnValueOnce({
          populate: jest.fn().mockResolvedValueOnce(mockPopulated),
        }),
      };
      jest.spyOn(Payment, 'findOne').mockReturnValueOnce(mockFindOne);

      const req = {
        params: { bookingId: 'booking123' },
        user: { _id: 'user123', role: 'customer' },
      };
      const res = { json: jest.fn() };
      const next = jest.fn();

      await getPaymentByBooking(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPopulated,
      });
    });
  });
});
