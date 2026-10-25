'use strict';
const {
  ScheduleRoomCleaningTask,
  InspectRoomTask,
  HandleServiceRequestTask,
  ReportMaintenanceTask
} = require('../tasks/housekeepingTasks');

class HousekeepingAgent {
  /** @param {{ type: string, payload: object }} task */
  async process(task) {
    try {
      let result;
      switch (task.type) {
        case 'ScheduleRoomCleaningTask':
          result = await ScheduleRoomCleaningTask.execute(task.payload);
          break;
        case 'InspectRoomTask':
          result = await InspectRoomTask.execute(task.payload);
          break;
        case 'HandleServiceRequestTask':
          result = await HandleServiceRequestTask.execute(task.payload);
          break;
        case 'ReportMaintenanceTask':
          result = await ReportMaintenanceTask.execute(task.payload);
          break;
        default:
          throw new Error(`HousekeepingAgent: unknown task type '${task.type}'`);
      }
      return { success: true, result };
    } catch (err) {
      return { success: false, result: null, error: err.message };
    }
  }
}

module.exports = { HousekeepingAgent };
