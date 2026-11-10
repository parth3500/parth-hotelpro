'use strict';
const {
  CheckAvailabilityTask,
  CreateReservationTask,
  ModifyBookingTask,
  CancelReservationTask
} = require('../tasks/bookingTasks');

class BookingAgent {
  /** @param {{ type: string, payload: object }} task */
  async process(task) {
    try {
      let result;
      switch (task.type) {
        case 'CheckAvailabilityTask':
          result = await CheckAvailabilityTask.execute(task.payload);
          break;
        case 'CreateReservationTask':
          result = await CreateReservationTask.execute(task.payload);
          break;
        case 'ModifyBookingTask':
          result = await ModifyBookingTask.execute(task.payload);
          break;
        case 'CancelReservationTask':
          result = await CancelReservationTask.execute(task.payload);
          break;
        default:
          throw new Error(`BookingAgent: unknown task type '${task.type}'`);
      }
      return { success: true, result };
    } catch (err) {
      return { success: false, result: null, error: err.message };
    }
  }
}

module.exports = { BookingAgent };
