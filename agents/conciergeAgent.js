'use strict';
const {
  ProcessGuestInquiryTask,
  SendBookingConfirmationNotificationTask,
  RecommendAmenitiesTask
} = require('../tasks/conciergeTasks');

class ConciergeAgent {
  /** @param {{ type: string, payload: object }} task */
  async process(task) {
    try {
      let result;
      switch (task.type) {
        case 'ProcessGuestInquiryTask':
          result = await ProcessGuestInquiryTask.execute(task.payload);
          break;
        case 'SendBookingConfirmationNotificationTask':
          result = await SendBookingConfirmationNotificationTask.execute(task.payload);
          break;
        case 'RecommendAmenitiesTask':
          result = await RecommendAmenitiesTask.execute(task.payload);
          break;
        default:
          throw new Error(`ConciergeAgent: unknown task type '${task.type}'`);
      }
      return { success: true, result };
    } catch (err) {
      return { success: false, result: null, error: err.message };
    }
  }
}

module.exports = { ConciergeAgent };
