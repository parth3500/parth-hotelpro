const { createModel } = require('./modelFactory');

const NotificationSchema = {
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['booking', 'payment', 'service', 'housekeeping', 'system', 'agent'],
    default: 'system'
  },
  read: { type: Boolean, default: false },
  metadata: { type: Object, default: {} }
};

const Notification = createModel('Notification', NotificationSchema);

module.exports = Notification;
