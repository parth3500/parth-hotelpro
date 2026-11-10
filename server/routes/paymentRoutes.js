const express = require('express');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const paymentService = require('../services/paymentService');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validatePayment, sanitizeBody } = require('../middleware/validate');

const router = express.Router();

// shortcut: mock payment processing and simulated instant capture, upgrade to Stripe/Razorpay webhooks with asynchronous idempotency keys

// POST / (or /payments) - Process payment for a reservation
router.post('/', authenticateToken, sanitizeBody, validatePayment, async (req, res, next) => {
  try {
    const { bookingId, amount, paymentMethod, cardDetails } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${bookingId} not found.`
      });
    }

    // IDOR GUARD: guests may only pay for their own bookings
    const isStaffOrAdmin = ['admin', 'staff'].includes(req.user.role.toLowerCase());
    if (!isStaffOrAdmin && booking.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: you cannot submit payments for another user’s reservation.'
      });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This reservation is already fully paid.'
      });
    }

    const payment = await paymentService.processPayment({
      bookingId,
      userId: req.user.id,
      amount: amount ? Number(amount) : booking.totalAmount,
      paymentMethod: paymentMethod || 'card',
      cardDetails: cardDetails || {}
    });

    return res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      payment
    });
  } catch (err) {
    next(err);
  }
});

// GET / (or /payments) - List payments (Admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const payments = await Payment.find();
    return res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (err) {
    next(err);
  }
});

// GET /:bookingId (or /payments/:bookingId) - Get payment by booking ID (IDOR Guard)
router.get('/:bookingId', authenticateToken, async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ bookingId: req.params.bookingId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: `No payment found for booking ID ${req.params.bookingId}.`
      });
    }

    // IDOR GUARD: guest can only view their own payment
    const isStaffOrAdmin = ['admin', 'staff'].includes(req.user.role.toLowerCase());
    if (!isStaffOrAdmin && payment.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: you do not have permission to view this payment record.'
      });
    }

    return res.status(200).json({
      success: true,
      payment
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
