const invoiceService = require('./invoiceService');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const AdminLog = require('../models/AdminLog');

class PaymentService {
  async processPayment({ bookingId, userId, amount, paymentMethod = 'card', cardDetails = {} }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error(`Booking not found with ID ${bookingId}`);
    }

    if (booking.paymentStatus === 'paid') {
      throw new Error('This reservation is already fully paid.');
    }

    // Validate payment credentials
    if (paymentMethod === 'card') {
      const cardNumber = (cardDetails.number || '').replace(/\s+/g, '');
      if (cardNumber && cardNumber.length < 13) {
        throw new Error('Invalid credit card number format.');
      }
    }

    // Compute financial breakdown
    const breakdown = invoiceService.calculateBreakdown(amount);
    const transactionId = 'tx_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    const invoiceNumber = invoiceService.generateInvoiceNumber();

    const payment = await Payment.create({
      bookingId: booking._id.toString(),
      userId: userId || booking.userId,
      amount: breakdown.total,
      subtotal: breakdown.subtotal,
      tax: breakdown.tax,
      serviceFee: breakdown.serviceFee,
      discount: breakdown.discount,
      currency: 'USD',
      paymentMethod,
      transactionId,
      invoiceNumber,
      status: 'success'
    });

    // Update booking payment status
    await Booking.findByIdAndUpdate(booking._id, {
      paymentStatus: 'paid',
      paymentId: payment._id.toString(),
      totalAmount: breakdown.total
    });

    // Log admin audit
    await AdminLog.create({
      action: 'PAYMENT_PROCESSED',
      performedBy: userId || 'Guest',
      performedByRole: 'guest',
      targetResource: 'Payment',
      targetId: payment._id.toString(),
      details: { bookingId, amount: breakdown.total, transactionId }
    });

    // Notify guest
    await Notification.create({
      userId: booking.userId,
      title: 'Payment Received',
      message: `Your payment of $${breakdown.total} for booking #${booking.bookingReference} was successful. Invoice: ${invoiceNumber}`,
      type: 'payment',
      metadata: { invoiceNumber, transactionId }
    });

    return payment;
  }

  async processRefund(paymentId, reason = 'Guest Cancellation') {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error(`Payment record not found with ID ${paymentId}`);
    }

    if (payment.status === 'refunded') {
      throw new Error('Payment has already been refunded.');
    }

    const refundTransactionId = 'ref_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const refundAmount = payment.amount;

    const updatedPayment = await Payment.findByIdAndUpdate(payment._id, {
      status: 'refunded',
      refundAmount,
      refundTransactionId
    });

    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: 'refunded',
      refundAmount
    });

    await AdminLog.create({
      action: 'PAYMENT_REFUNDED',
      performedBy: 'BillingAgent',
      performedByRole: 'system',
      targetResource: 'Payment',
      targetId: payment._id.toString(),
      details: { refundAmount, refundTransactionId, reason }
    });

    return updatedPayment;
  }
}

module.exports = new PaymentService();
