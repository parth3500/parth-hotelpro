const express = require('express');
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// shortcut: polling-based notification dispatch, upgrade to WebSockets / Server-Sent Events (SSE) for instantaneous push delivery

// GET / (or /notifications) - Get user's own notifications (IDOR Guard)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    // IDOR GUARD: users only see notifications addressed to them
    const notifications = await Notification.find({ userId: req.user.id });

    // Sort by latest first
    notifications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.read).length,
      notifications
    });
  } catch (err) {
    next(err);
  }
});

// PUT /read-all (or /notifications/read-all) - Mark all user's notifications as read
router.put('/read-all', authenticateToken, async (req, res, next) => {
  try {
    const userNotifications = await Notification.find({ userId: req.user.id, read: false });
    for (const notif of userNotifications) {
      await Notification.findByIdAndUpdate(notif._id, { read: true });
    }

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
});

// PUT /:id/read (or /notifications/:id/read) - Mark single notification as read (IDOR Guard)
router.put('/:id/read', authenticateToken, async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: `Notification with ID ${req.params.id} not found.`
      });
    }

    // IDOR GUARD: user can only mark their own notification as read
    if (notification.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: you cannot modify notifications belonging to another user.'
      });
    }

    const updated = await Notification.findByIdAndUpdate(req.params.id, { read: true });

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification: updated
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
