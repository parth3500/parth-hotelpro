const { createModel } = require('./modelFactory');

// shortcut: no report caching or scheduling, add when reports run on a cron
const ReportSchema = {
  type: {
    type: String,
    enum: ['occupancy', 'revenue', 'bookings', 'guest-activity'],
    required: true
  },
  hotelId: { type: String, default: '' },   // ref Hotel
  generatedBy: { type: String, default: '' }, // ref User
  period: { type: String, default: '' },    // e.g. '2024-01'
  data: { type: Object, default: {} }       // Mixed/flexible report payload
};

const Report = createModel('Report', ReportSchema);

module.exports = Report;
