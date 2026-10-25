const express = require('express');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const CheckInOut = require('../models/CheckInOut');
const ServiceRequest = require('../models/ServiceRequest');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { sanitizeBody } = require('../middleware/validate');

const router = express.Router();

// shortcut: on-the-fly dashboard counts over in-memory collections, upgrade to Redis counters or database aggregation views under high staff concurrency

const VALID_ROOM_STATUSES = ['available', 'occupied', 'cleaning', 'maintenance'];

// GET /dashboard (or /staff/dashboard) - Staff operational dashboard
router.get('/dashboard', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res, next) => {
  try {
    const rooms = await Room.find();
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(r => r.status === 'available').length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const cleaningRooms = rooms.filter(r => r.status === 'cleaning').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;

    const bookings = await Booking.find();
    const activeBookings = bookings.filter(b => ['confirmed', 'checked_in'].includes(b.status)).length;
    const checkedInGuests = bookings.filter(b => b.status === 'checked_in').length;

    const serviceRequests = await ServiceRequest.find();
    const pendingServiceRequests = serviceRequests.filter(s => s.status === 'pending').length;
    const inProgressServiceRequests = serviceRequests.filter(s => s.status === 'in_progress').length;

    const checkInOutLogs = await CheckInOut.find();
    const today = new Date().toISOString().slice(0, 10);
    const todayCheckIns = checkInOutLogs.filter(c =>
      c.type === 'check_in' && (c.createdAt || c.timestamp || '').toString().slice(0, 10) === today
    ).length;
    const todayCheckOuts = checkInOutLogs.filter(c =>
      c.type === 'check_out' && (c.createdAt || c.timestamp || '').toString().slice(0, 10) === today
    ).length;

    return res.status(200).json({
      success: true,
      dashboard: {
        rooms: {
          total: totalRooms,
          available: availableRooms,
          occupied: occupiedRooms,
          cleaning: cleaningRooms,
          maintenance: maintenanceRooms,
          occupancyRate: totalRooms > 0 ? Number(((occupiedRooms / totalRooms) * 100).toFixed(1)) : 0
        },
        bookings: {
          active: activeBookings,
          checkedIn: checkedInGuests,
          todayCheckIns,
          todayCheckOuts
        },
        services: {
          pending: pendingServiceRequests,
          inProgress: inProgressServiceRequests,
          totalActive: pendingServiceRequests + inProgressServiceRequests
        }
      },
      metrics: {
        occupancyRate: totalRooms > 0 ? Number(((occupiedRooms / totalRooms) * 100).toFixed(1)) : 0,
        activeCheckins: checkedInGuests,
        openServiceTickets: pendingServiceRequests + inProgressServiceRequests,
        roomsCleaning: cleaningRooms
      }
    });
  } catch (err) {
    next(err);
  }
});

// PUT /room/:id/status (or /staff/room/:id/status) - Update room housekeeping/maintenance status
router.put('/room/:id/status', authenticateToken, authorizeRoles('staff', 'admin'), sanitizeBody, async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_ROOM_STATUSES.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid room status. Allowed values: ${VALID_ROOM_STATUSES.join(', ')}`
      });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room with ID ${req.params.id} not found.`
      });
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, {
      status: status.toLowerCase()
    });

    return res.status(200).json({
      success: true,
      message: `Room status updated to '${status}' successfully`,
      room: updatedRoom
    });
  } catch (err) {
    next(err);
  }
});

// GET /checkins (or /staff/checkins) - Get check-in and check-out activity logs
router.get('/checkins', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res, next) => {
  try {
    const { type, roomNumber } = req.query;
    let query = {};

    if (type) query.type = type;
    if (roomNumber) query.roomNumber = roomNumber;

    const logs = await CheckInOut.find(query);
    logs.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));

    return res.status(200).json({
      success: true,
      count: logs.length,
      checkins: logs
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
