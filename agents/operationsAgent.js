'use strict';
const {
  GenerateOccupancyReportTask,
  AuditSystemSecurityLogsTask,
  BalanceStaffWorkloadTask
} = require('../tasks/operationsTasks');

class OperationsAgent {
  /** @param {{ type: string, payload: object }} task */
  async process(task) {
    try {
      let result;
      switch (task.type) {
        case 'GenerateOccupancyReportTask':
          result = await GenerateOccupancyReportTask.execute(task.payload);
          break;
        case 'AuditSystemSecurityLogsTask':
          result = await AuditSystemSecurityLogsTask.execute(task.payload);
          break;
        case 'BalanceStaffWorkloadTask':
          result = await BalanceStaffWorkloadTask.execute(task.payload);
          break;
        default:
          throw new Error(`OperationsAgent: unknown task type '${task.type}'`);
      }
      return { success: true, result };
    } catch (err) {
      return { success: false, result: null, error: err.message };
    }
  }
}

module.exports = { OperationsAgent };
