const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Payment must belong to a booking'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Payment must belong to a user'],
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'demo'],
    default: 'demo',
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success',
  },
  transactionId: {
    type: String,
    required: true,
    default: () => `txn_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`,
  },
}, {
  timestamps: true,
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
