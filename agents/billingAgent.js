'use strict';
const {
  ProcessPaymentTransactionTask,
  GenerateInvoiceTask,
  CalculateSeasonalRatesTask,
  ProcessRefundTransactionTask
} = require('../tasks/billingTasks');

class BillingAgent {
  /** @param {{ type: string, payload: object }} task */
  async process(task) {
    try {
      let result;
      switch (task.type) {
        case 'ProcessPaymentTransactionTask':
          result = await ProcessPaymentTransactionTask.execute(task.payload);
          break;
        case 'GenerateInvoiceTask':
          result = await GenerateInvoiceTask.execute(task.payload);
          break;
        case 'CalculateSeasonalRatesTask':
          result = await CalculateSeasonalRatesTask.execute(task.payload);
          break;
        case 'ProcessRefundTransactionTask':
          result = await ProcessRefundTransactionTask.execute(task.payload);
          break;
        default:
          throw new Error(`BillingAgent: unknown task type '${task.type}'`);
      }
      return { success: true, result };
    } catch (err) {
      return { success: false, result: null, error: err.message };
    }
  }
}

module.exports = { BillingAgent };
