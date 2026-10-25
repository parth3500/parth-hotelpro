const Booking = require('../server/models/Booking');
const Room = require('../server/models/Room');

class CheckAvailabilityTask {
  static get taskName() {
    return 'CheckAvailabilityTask';
  }

  static async execute({ roomId, checkInDate, checkOutDate, excludeBookingId = null }) {
    if (!roomId || !checkInDate || !checkOutDate) {
      throw new Error('roomId, checkInDate, and checkOutDate are required.');
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return { available: false, reason: `Room ${roomId} not found.` };
    }

    if (room.status === 'maintenance') {
      return { available: false, reason: 'Room is currently under maintenance.' };
    }

    const targetCheckIn = new Date(checkInDate);
    const targetCheckOut = new Date(checkOutDate);

    if (isNaN(targetCheckIn) || isNaN(targetCheckOut) || targetCheckIn >= targetCheckOut) {
      return { available: false, reason: 'Check-out date must be after check-in date.' };
    }

    // Find all active bookings for this room
    const existingBookings = await Booking.find({
      roomId: room._id.toString(),
      status: { $in: ['confirmed', 'checked_in', 'pending'] }
    });

    for (const b of existingBookings) {
      if (excludeBookingId && (b._id.toString() === excludeBookingId || b.id === excludeBookingId)) {
        continue;
      }
      const bIn = new Date(b.checkInDate);
      const bOut = new Date(b.checkOutDate);

      // Overlap check: (targetIn < bOut) && (targetOut > bIn)
      if (targetCheckIn < bOut && targetCheckOut > bIn) {
        return {
          available: false,
          reason: `Room is already booked from ${b.checkInDate} to ${b.checkOutDate} (Booking #${b.bookingReference}).`
        };
      }
    }

    return { available: true, room };
  }
}

class CreateReservationTask {
  static get taskName() {
    return 'CreateReservationTask';
  }

  static async execute({ userId, guestName, guestEmail, guestPhone, roomId, checkInDate, checkOutDate, guestsCount = 1, specialRequests = '' }) {
    const availability = await CheckAvailabilityTask.execute({ roomId, checkInDate, checkOutDate });
    if (!availability.available) {
      throw new Error(availability.reason);
    }

    const room = availability.room;
    const targetIn = new Date(checkInDate);
    const targetOut = new Date(checkOutDate);
    const diffTime = Math.abs(targetOut - targetIn);
    const totalNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalAmount = Number((room.pricePerNight * totalNights).toFixed(2));

    const ref = 'BK-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

    const booking = await Booking.create({
      bookingReference: ref,
      userId: userId || 'guest_anon',
      guestName: guestName || 'Valued Guest',
      guestEmail: guestEmail || 'guest@example.com',
      guestPhone: guestPhone || '',
      roomId: room._id.toString(),
      roomNumber: room.roomNumber,
      roomCategory: room.category,
      checkInDate,
      checkOutDate,
      totalNights,
      guestsCount,
      totalAmount,
      status: 'confirmed',
      paymentStatus: 'pending',
      specialRequests
    });

    return {
      success: true,
      booking,
      totalNights,
      totalAmount
    };
  }
}

class ModifyBookingTask {
  static get taskName() {
    return 'ModifyBookingTask';
  }

  static async execute({ bookingId, newCheckInDate, newCheckOutDate, guestsCount, specialRequests }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found.`);
    }

    if (['cancelled', 'checked_out'].includes(booking.status)) {
      throw new Error(`Cannot modify booking in '${booking.status}' status.`);
    }

    const checkIn = newCheckInDate || booking.checkInDate;
    const checkOut = newCheckOutDate || booking.checkOutDate;

    const availability = await CheckAvailabilityTask.execute({
      roomId: booking.roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      excludeBookingId: booking._id.toString()
    });

    if (!availability.available) {
      throw new Error(availability.reason);
    }

    const targetIn = new Date(checkIn);
    const targetOut = new Date(checkOut);
    const totalNights = Math.max(1, Math.ceil((targetOut - targetIn) / (1000 * 60 * 60 * 24)));
    const room = await Room.findById(booking.roomId);
    const totalAmount = Number((room.pricePerNight * totalNights).toFixed(2));

    const updated = await Booking.findByIdAndUpdate(booking._id, {
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalNights,
      totalAmount,
      guestsCount: guestsCount !== undefined ? guestsCount : booking.guestsCount,
      specialRequests: specialRequests !== undefined ? specialRequests : booking.specialRequests
    });

    return { success: true, booking: updated };
  }
}

class CancelReservationTask {
  static get taskName() {
    return 'CancelReservationTask';
  }

  static async execute({ bookingId, reason = 'Guest requested cancellation' }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found.`);
    }

    if (booking.status === 'cancelled') {
      return { success: true, message: 'Booking is already cancelled.', booking };
    }

    // Determine refund eligibility: if check-in is more than 24h away, 100% refund, otherwise 80%
    const checkInTime = new Date(booking.checkInDate).getTime();
    const now = Date.now();
    const hoursUntilCheckIn = (checkInTime - now) / (1000 * 60 * 60);

    let refundPercentage = 1.0;
    if (hoursUntilCheckIn < 24) {
      refundPercentage = 0.8; // 20% late cancellation penalty
    }

    const refundAmount = booking.paymentStatus === 'paid'
      ? Number((booking.totalAmount * refundPercentage).toFixed(2))
      : 0;

    const updated = await Booking.findByIdAndUpdate(booking._id, {
      status: 'cancelled',
      cancellationReason: reason,
      refundAmount,
      paymentStatus: refundAmount > 0 ? 'refunded' : booking.paymentStatus
    });

    return {
      success: true,
      booking: updated,
      refundAmount,
      refundPercentage: refundPercentage * 100
    };
  }
}

module.exports = {
  CheckAvailabilityTask,
  CreateReservationTask,
  ModifyBookingTask,
  CancelReservationTask
};
