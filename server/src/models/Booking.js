const mongoose = require('mongoose');
const Room = require('./Room');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user'],
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Booking must belong to a room'],
  },
  checkInDate: {
    type: Date,
    required: [true, 'Please provide check-in date'],
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Please provide check-out date'],
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Validate check-in / check-out dates and room availability overlap
bookingSchema.pre('validate', async function(next) {
  if (!this.checkInDate || !this.checkOutDate) return next();

  const checkIn = new Date(this.checkInDate);
  const checkOut = new Date(this.checkOutDate);

  if (checkIn >= checkOut) {
    this.invalidate('checkOutDate', 'Check-out date must be after check-in date');
    return next();
  }

  // Calculate price snapshot if room is present and price not set or being created
  if (this.room && (!this.totalPrice || this.isModified('checkInDate') || this.isModified('checkOutDate') || this.isModified('room'))) {
    const roomDoc = await Room.findById(this.room);
    if (roomDoc) {
      const diffTime = Math.abs(checkOut - checkIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const nightly = roomDoc.pricePerNight || roomDoc.price || 100;
      this.totalPrice = diffDays * nightly;
    }
  }

  next();
});

// Overlap validation on save
bookingSchema.pre('save', async function(next) {
  if (this.status === 'cancelled') return next();

  const query = {
    room: this.room,
    status: { $ne: 'cancelled' },
    checkInDate: { $lt: this.checkOutDate },
    checkOutDate: { $gt: this.checkInDate },
  };

  if (!this.isNew) {
    query._id = { $ne: this._id };
  }

  const existingBooking = await mongoose.model('Booking').findOne(query);
  if (existingBooking) {
    return next(new Error('Room is already booked for the selected dates'));
  }

  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
