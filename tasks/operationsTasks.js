'use strict';
const Booking = require('../server/models/Booking');
const Room = require('../server/models/Room');
const AdminLog = require('../server/models/AdminLog');

class GenerateOccupancyReportTask {
  static get taskName() { return 'GenerateOccupancyReportTask'; }

  static async execute({ date = new Date() } = {}) {
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Booking.countDocuments({
      status: 'checked_in',
      checkInDate: { $lte: date },
      checkOutDate: { $gte: date }
    });
    const occupancyRate = totalRooms > 0
      ? Number(((occupiedRooms / totalRooms) * 100).toFixed(2))
      : 0;

    // RevPAR: revenue per available room — sum revenue of checked_in bookings / totalRooms
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'checked_in' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const revenue = revenueAgg.length ? revenueAgg[0].total : 0;
    const revPAR = totalRooms > 0 ? Number((revenue / totalRooms).toFixed(2)) : 0;

    return {
      success: true,
      totalRooms,
      occupiedRooms,
      availableRooms: totalRooms - occupiedRooms,
      occupancyRate,
      revenue,
      revPAR,
      reportDate: date
    };
  }
}

class AuditSystemSecurityLogsTask {
  static get taskName() { return 'AuditSystemSecurityLogsTask'; }

  static async execute({ limit = 50 } = {}) {
    const logs = await AdminLog.find().sort({ createdAt: -1 }).limit(limit).lean();
    // Flag entries where action contains suspicious keywords
    const suspicious = logs.filter(l =>
      /delete|drop|remove|unauthorized|fail/i.test(l.action || '')
    );
    return {
      success: true,
      totalScanned: logs.length,
      suspiciousCount: suspicious.length,
      suspicious
    };
  }
}

class BalanceStaffWorkloadTask {
  static get taskName() { return 'BalanceStaffWorkloadTask'; }

  // shortcut: no real staff model yet — returns placeholder; upgrade when Staff model exists
  static async execute({ date = new Date() } = {}) {
    return {
      success: true,
      note: 'Staff workload balancing scheduled for when Staff model is implemented.',
      date
    };
  }
}

module.exports = {
  GenerateOccupancyReportTask,
  AuditSystemSecurityLogsTask,
  BalanceStaffWorkloadTask
};
