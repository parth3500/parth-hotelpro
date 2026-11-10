const Room = require('../server/models/Room');
const ServiceRequest = require('../server/models/ServiceRequest');
const Notification = require('../server/models/Notification');

class ScheduleRoomCleaningTask {
  static get taskName() {
    return 'ScheduleRoomCleaningTask';
  }

  static async execute({ roomId, reason = 'Guest check-out' }) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found.`);
    }

    const updatedRoom = await Room.findByIdAndUpdate(room._id, {
      status: 'cleaning'
    });

    const serviceReq = await ServiceRequest.create({
      userId: 'system',
      guestName: 'Front Desk / Auto',
      roomNumber: room.roomNumber,
      type: 'cleaning',
      details: `Scheduled room sanitization & linen change: ${reason}`,
      priority: 'high',
      status: 'assigned',
      assignedStaffName: 'Housekeeping Team'
    });

    return {
      success: true,
      room: updatedRoom,
      serviceRequest: serviceReq,
      status: 'cleaning'
    };
  }
}

class InspectRoomTask {
  static get taskName() {
    return 'InspectRoomTask';
  }

  static async execute({ roomId, inspectedBy = 'Lead Housekeeper', passed = true, notes = '' }) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found.`);
    }

    const newStatus = passed ? 'available' : 'cleaning';
    const updatedRoom = await Room.findByIdAndUpdate(room._id, {
      status: newStatus
    });

    return {
      success: true,
      room: updatedRoom,
      inspectedBy,
      passed,
      notes
    };
  }
}

class HandleServiceRequestTask {
  static get taskName() {
    return 'HandleServiceRequestTask';
  }

  static async execute({ requestId, staffId, staffName, status = 'completed' }) {
    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      throw new Error(`Service request ${requestId} not found.`);
    }

    const updated = await ServiceRequest.findByIdAndUpdate(request._id, {
      status,
      assignedStaffId: staffId || request.assignedStaffId,
      assignedStaffName: staffName || request.assignedStaffName || 'Housekeeping Staff',
      completedAt: status === 'completed' ? new Date() : null
    });

    await Notification.create({
      userId: request.userId,
      title: 'Service Request Update',
      message: `Your request for ${request.type} (Room ${request.roomNumber}) is now ${status}.`,
      type: 'service',
      metadata: { requestId: request._id.toString() }
    });

    return { success: true, serviceRequest: updated };
  }
}

class ReportMaintenanceTask {
  static get taskName() {
    return 'ReportMaintenanceTask';
  }

  static async execute({ roomId, issueDescription, severity = 'high' }) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found.`);
    }

    const updatedRoom = await Room.findByIdAndUpdate(room._id, {
      status: 'maintenance'
    });

    const maintenanceTicket = await ServiceRequest.create({
      userId: 'system',
      guestName: 'Facility Management',
      roomNumber: room.roomNumber,
      type: 'maintenance',
      details: issueDescription,
      priority: severity === 'urgent' ? 'urgent' : 'high',
      status: 'in_progress',
      assignedStaffName: 'Maintenance Crew'
    });

    return {
      success: true,
      room: updatedRoom,
      maintenanceTicket
    };
  }
}

module.exports = {
  ScheduleRoomCleaningTask,
  InspectRoomTask,
  HandleServiceRequestTask,
  ReportMaintenanceTask
};
