const express = require('express');
const ServiceRequest = require('../models/ServiceRequest');
const Notification = require('../models/Notification');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateServiceRequest, sanitizeBody } = require('../middleware/validate');

const router = express.Router();

// shortcut: manual staff assignment for service requests, upgrade to automated round-robin skill-based dispatching engine

// POST / (or /services) - Create service request
router.post('/', authenticateToken, sanitizeBody, validateServiceRequest, async (req, res, next) => {
  try {
    const { roomNumber, type, details, priority } = req.body;

    const serviceRequest = await ServiceRequest.create({
      userId: req.user.id,
      guestName: req.user.name || 'Guest',
      roomNumber: roomNumber.trim(),
      type: type || 'cleaning',
      details: details.trim(),
      priority: priority || 'medium',
      status: 'pending'
    });

    await Notification.create({
      userId: req.user.id,
      title: 'Service Request Submitted',
      message: `Your request for ${type || 'room service'} in Room ${roomNumber} has been logged.`,
      type: 'service',
      metadata: { serviceRequestId: serviceRequest._id }
    });

    return res.status(201).json({
      success: true,
      message: 'Service request submitted successfully',
      serviceRequest
    });
  } catch (err) {
    next(err);
  }
});

// GET / (or /services) - Get service requests (IDOR Guard: guest gets own, staff/admin gets all)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const isStaffOrAdmin = ['admin', 'staff'].includes(req.user.role.toLowerCase());
    let query = {};

    if (!isStaffOrAdmin) {
      // IDOR GUARD: guests only see their own service requests
      query.userId = req.user.id;
    } else {
      if (req.query.status) query.status = req.query.status;
      if (req.query.type) query.type = req.query.type;
      if (req.query.roomNumber) query.roomNumber = req.query.roomNumber;
    }

    const serviceRequests = await ServiceRequest.find(query);
    serviceRequests.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.status(200).json({
      success: true,
      count: serviceRequests.length,
      serviceRequests
    });
  } catch (err) {
    next(err);
  }
});

// PUT /:id (or /services/:id) - Staff updates service request status or assignment
router.put('/:id', authenticateToken, authorizeRoles('staff', 'admin'), sanitizeBody, async (req, res, next) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: `Service request with ID ${req.params.id} not found.`
      });
    }

    const { status, assignedStaffId, assignedStaffName, priority } = req.body;
    const updateData = {};

    if (status) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date();
      }
    }
    if (assignedStaffId !== undefined) updateData.assignedStaffId = assignedStaffId;
    if (assignedStaffName !== undefined) updateData.assignedStaffName = assignedStaffName;
    if (priority) updateData.priority = priority;

    const updated = await ServiceRequest.findByIdAndUpdate(req.params.id, updateData);

    // Notify guest if request is completed
    if (status === 'completed' && serviceRequest.userId && serviceRequest.userId !== 'system') {
      await Notification.create({
        userId: serviceRequest.userId,
        title: 'Service Request Completed',
        message: `Your request for ${serviceRequest.type} in Room ${serviceRequest.roomNumber} has been fulfilled.`,
        type: 'service'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Service request updated successfully',
      serviceRequest: updated
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
