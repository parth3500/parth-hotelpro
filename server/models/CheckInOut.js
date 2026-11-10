const { createModel } = require('./modelFactory');

const CheckInOutSchema = {
  bookingId: { type: String, required: true },
  userId: { type: String, required: true },
  guestName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  type: { type: String, enum: ['check_in', 'check_out'], required: true },
  timestamp: { type: Date, default: () => new Date() },
  processedByStaffId: { type: String, default: null },
  processedByStaffName: { type: String, default: 'Automated Desk' },
  keyCardIssued: { type: Boolean, default: true },
  notes: { type: String, default: '' },
  inspectedRoomStatus: { type: String, default: 'clean' }
};

const CheckInOut = createModel('CheckInOut', CheckInOutSchema);

module.exports = CheckInOut;
