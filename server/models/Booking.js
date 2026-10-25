const { createModel } = require('./modelFactory');

const BookingSchema = {
  bookingReference: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  guestPhone: { type: String, default: '' },
  roomId: { type: String, required: true },
  roomNumber: { type: String, required: true },
  roomCategory: { type: String, default: 'Standard' },
  checkInDate: { type: String, required: true },
  checkOutDate: { type: String, required: true },
  totalNights: { type: Number, required: true },
  guestsCount: { type: Number, default: 1 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentId: { type: String, default: null },
  specialRequests: { type: String, default: '' },
  cancellationReason: { type: String, default: '' },
  refundAmount: { type: Number, default: 0 }
};

const Booking = createModel('Booking', BookingSchema);

module.exports = Booking;
