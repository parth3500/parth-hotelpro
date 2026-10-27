const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Process a payment for a booking (Demo Mode)
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking is already paid' });
    }

    // Demo mode: accept any valid payment amount matching or close to booking total price
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      amount: amount || booking.totalPrice,
      paymentMethod: paymentMethod || 'demo',
      status: 'success',
    });

    booking.paymentStatus = 'paid';
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully (Demo Mode)',
      data: payment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get payment by booking ID
// @route   GET /api/payments/booking/:bookingId
// @access  Private
const getPaymentByBooking = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId })
      .populate('booking')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found for this booking' });
    }

    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this payment' });
    }

    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPayment, getPaymentByBooking };
