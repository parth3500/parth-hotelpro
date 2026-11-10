const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const CheckInOut = require('../models/CheckInOut');
const ServiceRequest = require('../models/ServiceRequest');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateBooking, sanitizeBody } = require('../middleware/validate');

const router = express.Router();

// shortcut: linear memory date-interval check for double-booking prevention, upgrade to pessimistic locking or serializable transactions in distributed DB

// POST / (or /bookings) - Create new booking with double-booking prevention
router.post('/', authenticateToken, sanitizeBody, validateBooking, async (req, res, next) => {
  try {
    const {
      roomId,
      checkInDate,
      checkOutDate,
      guestName,
      guestEmail,
      guestPhone,
      guestsCount,
      specialRequests
    } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room with ID ${roomId} not found.`
      });
    }

    if (room.status === 'maintenance') {
      return res.status(400).json({
        success: false,
        message: 'This room is currently under maintenance and cannot be reserved.'
      });
    }

    const targetIn = new Date(checkInDate);
    const targetOut = new Date(checkOutDate);

    // Double-booking check: active bookings for this room
    const existingBookings = await Booking.find({
      roomId: (room._id || room.id).toString(),
      status: { $in: ['confirmed', 'checked_in', 'pending'] }
    });

    for (const b of existingBookings) {
      const bIn = new Date(b.checkInDate);
      const bOut = new Date(b.checkOutDate);

      // Overlap: (targetIn < bOut) && (targetOut > bIn)
      if (targetIn < bOut && targetOut > bIn) {
        return res.status(409).json({
          success: false,
          message: `Room ${room.roomNumber} is already booked from ${b.checkInDate} to ${b.checkOutDate}.`
        });
      }
    }

    const diffDays = Math.max(1, Math.ceil((targetOut - targetIn) / (1000 * 60 * 60 * 24)));
    const totalAmount = Number((room.pricePerNight * diffDays).toFixed(2));
    const bookingReference = 'BK-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

    const newBooking = await Booking.create({
      bookingReference,
      userId: req.user.id,
      guestName: guestName || req.user.name || 'Valued Guest',
      guestEmail: guestEmail || req.user.email || '',
      guestPhone: guestPhone || '',
      roomId: (room._id || room.id).toString(),
      roomNumber: room.roomNumber,
      roomCategory: room.category,
      checkInDate,
      checkOutDate,
      totalNights: diffDays,
      guestsCount: guestsCount ? Number(guestsCount) : 1,
      totalAmount,
      status: 'confirmed',
      paymentStatus: 'pending',
      specialRequests: specialRequests || ''
    });

    // Notify guest
    await Notification.create({
      userId: req.user.id,
      title: 'Booking Confirmed',
      message: `Your reservation #${bookingReference} for Room ${room.roomNumber} has been confirmed.`,
      type: 'booking',
      metadata: { bookingReference, roomId: room._id }
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: newBooking
    });
  } catch (err) {
    next(err);
  }
});

// GET / (or /bookings) - Get bookings (IDOR Guard: guest gets only own, admin/staff gets all)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const isStaffOrAdmin = ['admin', 'staff'].includes(req.user.role.toLowerCase());
    let query = {};

    if (!isStaffOrAdmin) {
      // IDOR GUARD: guests only see their own bookings
      query.userId = req.user.id;
    } else {
      if (req.query.userId) query.userId = req.query.userId;
      if (req.query.status) query.status = req.query.status;
      if (req.query.roomId) query.roomId = req.query.roomId;
    }

    let bookings = await Booking.find(query);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    next(err);
  }
});

// GET /:id (or /bookings/:id) - Get single booking (IDOR Guard)
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${req.params.id} not found.`
      });
    }

    // IDOR GUARD: guests can only access their own bookings
    const isStaffOrAdmin = ['admin', 'staff'].includes(req.user.role.toLowerCase());
    if (!isStaffOrAdmin && booking.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: you do not have permission to view this reservation.'
      });
    }

    return res.status(200).json({
      success: true,
      booking
    });
  } catch (err) {
    next(err);
  }
});

// PUT /:id/cancel (or /bookings/:id/cancel) - Cancel booking (IDOR Guard)
router.put('/:id/cancel', authenticateToken, sanitizeBody, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${req.params.id} not found.`
      });
    }

    // IDOR GUARD: guests can only cancel their own booking
    const isStaffOrAdmin = ['admin', 'staff'].includes(req.user.role.toLowerCase());
    if (!isStaffOrAdmin && booking.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: you do not have permission to cancel this reservation.'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled.'
      });
    }

    if (booking.status === 'checked_out') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a booking that has already completed.'
      });
    }

    const { reason } = req.body;
    const checkInTime = new Date(booking.checkInDate).getTime();
    const hoursUntilCheckIn = (checkInTime - Date.now()) / (1000 * 60 * 60);

    let refundRate = 1.0;
    if (hoursUntilCheckIn < 24) {
      refundRate = 0.8; // 20% penalty for cancellation under 24 hours
    }

    const refundAmount = booking.paymentStatus === 'paid'
      ? Number((booking.totalAmount * refundRate).toFixed(2))
      : 0;

    const updatedBooking = await Booking.findByIdAndUpdate(booking._id, {
      status: 'cancelled',
      cancellationReason: reason || 'Requested by guest',
      refundAmount,
      paymentStatus: refundAmount > 0 ? 'refunded' : booking.paymentStatus
    });

    // If there is an associated payment, mark it refunded
    if (booking.paymentId) {
      await Payment.findByIdAndUpdate(booking.paymentId, {
        status: 'refunded',
        refundAmount,
        refundTransactionId: 'ref_' + Date.now().toString(36)
      });
    }

    // In-app notification
    await Notification.create({
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Your reservation #${booking.bookingReference} has been cancelled. Refund: $${refundAmount}.`,
      type: 'booking',
      metadata: { bookingReference: booking.bookingReference, refundAmount }
    });

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
      refundAmount
    });
  } catch (err) {
    next(err);
  }
});

// PUT /:id/approve (or /bookings/:id/approve) - Admin/Staff approves a booking
router.put('/:id/approve', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${req.params.id} not found.`
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(booking._id, {
      status: 'confirmed'
    });

    await Notification.create({
      userId: booking.userId,
      title: 'Booking Approved',
      message: `Your reservation #${booking.bookingReference} was approved by hotel staff.`,
      type: 'booking'
    });

    return res.status(200).json({
      success: true,
      message: 'Booking approved successfully',
      booking: updatedBooking
    });
  } catch (err) {
    next(err);
  }
});

// POST /:id/checkin (or /bookings/:id/checkin) - Staff check-in guest
router.post('/:id/checkin', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${req.params.id} not found.`
      });
    }

    if (booking.status === 'checked_in') {
      return res.status(400).json({
        success: false,
        message: 'Guest is already checked in.'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot check in a cancelled reservation.'
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(booking._id, {
      status: 'checked_in'
    });

    // Update room status to occupied
    await Room.findByIdAndUpdate(booking.roomId, { status: 'occupied' });

    // Create CheckInOut record
    const checkInRecord = await CheckInOut.create({
      bookingId: booking._id.toString(),
      userId: booking.userId,
      guestName: booking.guestName,
      roomNumber: booking.roomNumber,
      type: 'check_in',
      processedByStaffId: req.user.id,
      processedByStaffName: req.user.name || 'Front Desk Staff',
      keyCardIssued: true
    });

    await Notification.create({
      userId: booking.userId,
      title: 'Welcome to HotelPro',
      message: `You have successfully checked into Room ${booking.roomNumber}. Enjoy your stay!`,
      type: 'system'
    });

    return res.status(200).json({
      success: true,
      message: 'Guest checked in successfully',
      booking: updatedBooking,
      checkInRecord
    });
  } catch (err) {
    next(err);
  }
});

// POST /:id/checkout (or /bookings/:id/checkout) - Staff check-out guest
router.post('/:id/checkout', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${req.params.id} not found.`
      });
    }

    if (booking.status !== 'checked_in') {
      return res.status(400).json({
        success: false,
        message: `Cannot check out booking currently in '${booking.status}' status.`
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(booking._id, {
      status: 'checked_out'
    });

    // Mark room status to cleaning
    await Room.findByIdAndUpdate(booking.roomId, { status: 'cleaning' });

    // Create CheckInOut record
    const checkOutRecord = await CheckInOut.create({
      bookingId: booking._id.toString(),
      userId: booking.userId,
      guestName: booking.guestName,
      roomNumber: booking.roomNumber,
      type: 'check_out',
      processedByStaffId: req.user.id,
      processedByStaffName: req.user.name || 'Front Desk Staff',
      inspectedRoomStatus: 'cleaning'
    });

    // Auto-dispatch housekeeping request
    await ServiceRequest.create({
      userId: 'system',
      guestName: booking.guestName,
      roomNumber: booking.roomNumber,
      type: 'cleaning',
      details: 'Automatic room cleaning dispatch following guest checkout',
      priority: 'high',
      status: 'assigned',
      assignedStaffName: 'Housekeeping Team'
    });

    await Notification.create({
      userId: booking.userId,
      title: 'Checkout Complete',
      message: `You have successfully checked out of Room ${booking.roomNumber}. We look forward to hosting you again!`,
      type: 'system'
    });

    return res.status(200).json({
      success: true,
      message: 'Guest checked out successfully',
      booking: updatedBooking,
      checkOutRecord
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
