const express = require('express');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Report = require('../models/Report');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { sanitizeBody } = require('../middleware/validate');

const router = express.Router();

// shortcut: linear aggregation for admin reports and statistics, upgrade to timeseries analytics with background aggregation workers

function sanitizeUser(user) {
  const u = user.toObject ? user.toObject() : { ...user };
  delete u.password;
  u.id = (u._id || u.id || '').toString();
  return u;
}

// All admin routes require admin role
router.use(authenticateToken, authorizeRoles('admin'));

// GET /users (or /admin/users) - List all users
router.get('/users', async (req, res, next) => {
  try {
    const { role, status } = req.query;
    let query = {};

    if (role) query.role = role.toLowerCase();
    if (status) query.status = status.toLowerCase();

    const users = await User.find(query);
    const sanitized = users.map(u => sanitizeUser(u));

    return res.status(200).json({
      success: true,
      count: sanitized.length,
      users: sanitized
    });
  } catch (err) {
    next(err);
  }
});

// GET /hotels (or /admin/hotels) - List hotels or hotel property configuration
router.get('/hotels', async (req, res, next) => {
  try {
    let hotels = await Hotel.find();

    // If database has no hotel record yet, seed default resort profile
    if (!hotels || hotels.length === 0) {
      const defaultHotel = await Hotel.create({
        name: 'HotelPro Grand Resort & Spa',
        description: 'Luxury seaside retreat offering world-class hospitality and amenities.',
        address: '100 Oceanview Boulevard, Paradise Bay',
        city: 'Paradise Bay',
        country: 'United States',
        rating: 4.9,
        amenities: ['Free Wi-Fi', 'Infinity Pool', 'Spa & Wellness', 'Fine Dining', 'Gym', 'Valet Parking'],
        contactEmail: 'concierge@hotelpro.com',
        contactPhone: '+1 (555) 123-4567',
        checkInTime: '15:00',
        checkOutTime: '11:00'
      });
      hotels = [defaultHotel];
    }

    return res.status(200).json({
      success: true,
      count: hotels.length,
      hotels
    });
  } catch (err) {
    next(err);
  }
});

// GET /reports (or /admin/reports) - Get system reports and aggregated operational metrics
router.get('/reports', async (req, res, next) => {
  try {
    const storedReports = await Report.find();

    // Dynamically compute current executive summary metrics
    const [rooms, bookings, payments, users] = await Promise.all([
      Room.find(),
      Booking.find(),
      Payment.find(),
      User.find()
    ]);

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const totalRevenue = payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const dynamicSummary = {
      totalUsers: users.length,
      totalRooms,
      occupiedRooms,
      occupancyRate: totalRooms > 0 ? Number(((occupiedRooms / totalRooms) * 100).toFixed(1)) : 0,
      totalBookings: bookings.length,
      activeBookings: bookings.filter(b => ['confirmed', 'checked_in'].includes(b.status)).length,
      completedBookings: bookings.filter(b => b.status === 'checked_out').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: Number(totalRevenue.toFixed(2))
    };

    return res.status(200).json({
      success: true,
      summary: dynamicSummary,
      reports: storedReports
    });
  } catch (err) {
    next(err);
  }
});

// PUT /users/:id (or /admin/users/:id) - Admin updates user role, status, or department
router.put(['/users/:id', '/users/:id/role'], sanitizeBody, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${req.params.id} not found.`
      });
    }

    const { role, status, assignedDepartment, name, phone } = req.body;
    const updateData = {};

    if (role) {
      const normalizedRole = role.toLowerCase();
      if (!['guest', 'staff', 'admin'].includes(normalizedRole)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be one of: guest, staff, admin'
        });
      }
      updateData.role = normalizedRole;
    }

    if (status) {
      const normalizedStatus = status.toLowerCase();
      if (!['active', 'suspended'].includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: active, suspended'
        });
      }
      updateData.status = normalizedStatus;
    }

    if (assignedDepartment !== undefined) updateData.assignedDepartment = assignedDepartment;
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData);

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: sanitizeUser(updatedUser)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
