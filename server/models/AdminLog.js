const { createModel } = require('./modelFactory');

// shortcut: no log rotation/archival, add when audit log grows large
const AdminLogSchema = {
  adminId: { type: String, required: true }, // ref User
  action: { type: String, required: true },
  targetType: { type: String, default: '' }, // e.g. 'User', 'Booking'
  targetId: { type: String, default: '' },
  details: { type: String, default: '' },
  ip: { type: String, default: '' }
};

const AdminLog = createModel('AdminLog', AdminLogSchema);

module.exports = AdminLog;
