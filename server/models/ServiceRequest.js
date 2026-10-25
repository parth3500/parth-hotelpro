const { createModel } = require('./modelFactory');

const ServiceRequestSchema = {
  userId: { type: String, required: true },
  guestName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  type: {
    type: String,
    enum: ['cleaning', 'room_service', 'towels', 'maintenance', 'wake_up_call', 'other'],
    default: 'cleaning'
  },
  details: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedStaffId: { type: String, default: null },
  assignedStaffName: { type: String, default: null },
  completedAt: { type: Date, default: null }
};

const ServiceRequest = createModel('ServiceRequest', ServiceRequestSchema);

module.exports = ServiceRequest;
