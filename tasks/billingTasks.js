'use strict';
const Payment = require('../server/models/Payment');
const Booking = require('../server/models/Booking');
const invoiceService = require('../server/services/invoiceService');
const paymentService = require('../server/services/paymentService');

class ProcessPaymentTransactionTask {
  static get taskName() { return 'ProcessPaymentTransactionTask'; }

  static async execute({ bookingId, amount, method = 'card', transactionId }) {
    if (!bookingId || !amount) {
      throw new Error('bookingId and amount are required.');
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error(`Booking ${bookingId} not found.`);

    // shortcut: delegates to existing paymentService; upgrade when gateway is live
    const paymentResult = await paymentService.processPayment({
      bookingId,
      amount,
      method,
      transactionId: transactionId || `TXN-${Date.now()}`
    });

    if (paymentResult.success) {
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' });
    }

    return { success: paymentResult.success, payment: paymentResult };
  }
}

class GenerateInvoiceTask {
  static get taskName() { return 'GenerateInvoiceTask'; }

  static async execute({ bookingId }) {
    if (!bookingId) throw new Error('bookingId is required.');
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) throw new Error(`Booking ${bookingId} not found.`);

    const invoice = await invoiceService.generateInvoice(booking);
    return { success: true, invoice };
  }
}

class CalculateSeasonalRatesTask {
  static get taskName() { return 'CalculateSeasonalRatesTask'; }

  static async execute({ baseRate, checkInDate }) {
    if (!baseRate || !checkInDate) throw new Error('baseRate and checkInDate are required.');

    const month = new Date(checkInDate).getMonth() + 1; // 1-12
    // Peak season: Dec–Feb (1,2,12) → +30%; shoulder Mar–May, Sep–Nov → +10%; off-peak rest → 0%
    let multiplier = 1.0;
    if ([12, 1, 2].includes(month)) multiplier = 1.30;
    else if ([3, 4, 5, 9, 10, 11].includes(month)) multiplier = 1.10;

    const adjustedRate = Number((baseRate * multiplier).toFixed(2));
    return {
      success: true,
      baseRate,
      multiplier,
      adjustedRate,
      season: multiplier === 1.30 ? 'peak' : multiplier === 1.10 ? 'shoulder' : 'off-peak'
    };
  }
}

class ProcessRefundTransactionTask {
  static get taskName() { return 'ProcessRefundTransactionTask'; }

  static async execute({ bookingId, refundAmount, reason = 'Guest cancellation' }) {
    if (!bookingId || !refundAmount) throw new Error('bookingId and refundAmount are required.');

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error(`Booking ${bookingId} not found.`);
    if (booking.paymentStatus !== 'paid') {
      throw new Error('Cannot refund: booking has not been paid.');
    }

    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'refunded',
      refundAmount,
      cancellationReason: reason
    });

    return { success: true, bookingId, refundAmount, reason };
  }
}

module.exports = {
  ProcessPaymentTransactionTask,
  GenerateInvoiceTask,
  CalculateSeasonalRatesTask,
  ProcessRefundTransactionTask
};
