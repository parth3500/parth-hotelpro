const { createModel } = require('./modelFactory');

const PaymentSchema = {
  bookingId: { type: String, required: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentMethod: { type: String, default: 'card' },
  transactionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['success', 'pending', 'failed', 'refunded'], default: 'success' },
  invoiceNumber: { type: String, required: true, unique: true },
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  serviceFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  refundAmount: { type: Number, default: 0 },
  refundTransactionId: { type: String, default: null }
};

const Payment = createModel('Payment', PaymentSchema);

module.exports = Payment;
