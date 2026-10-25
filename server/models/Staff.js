const { createModel } = require('./modelFactory');

// shortcut: no shift scheduling logic, add when roster feature is built
const StaffSchema = {
  userId: { type: String, required: true }, // ref User
  department: {
    type: String,
    enum: ['Housekeeping', 'Reception', 'Management', 'Maintenance', 'Concierge'],
    required: true
  },
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night'],
    default: 'Morning'
  },
  assignedHotelId: { type: String, default: '' }, // ref Hotel
  isActive: { type: Boolean, default: true }
};

const Staff = createModel('Staff', StaffSchema);

module.exports = Staff;
