const { createModel } = require('./modelFactory');

// shortcut: no loyalty tier logic, add when reward program is built
const GuestSchema = {
  userId: { type: String, required: true }, // ref User
  preferences: { type: String, default: '' },
  specialRequests: { type: String, default: '' },
  loyaltyPoints: { type: Number, default: 0 },
  totalStays: { type: Number, default: 0 }
};

const Guest = createModel('Guest', GuestSchema);

module.exports = Guest;
