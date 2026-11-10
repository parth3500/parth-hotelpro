'use strict';
const { BookingAgent } = require('./bookingAgent');
const { HousekeepingAgent } = require('./housekeepingAgent');
const { ConciergeAgent } = require('./conciergeAgent');
const { BillingAgent } = require('./billingAgent');
const { OperationsAgent } = require('./operationsAgent');

// Route table: taskType prefix → agent instance
// shortcut: static routing map; upgrade to dynamic plugin registry when agent count > 10
const agents = {
  CheckAvailabilityTask: new BookingAgent(),
  CreateReservationTask: new BookingAgent(),
  ModifyBookingTask: new BookingAgent(),
  CancelReservationTask: new BookingAgent(),

  ScheduleRoomCleaningTask: new HousekeepingAgent(),
  InspectRoomTask: new HousekeepingAgent(),
  HandleServiceRequestTask: new HousekeepingAgent(),
  ReportMaintenanceTask: new HousekeepingAgent(),

  ProcessGuestInquiryTask: new ConciergeAgent(),
  SendBookingConfirmationNotificationTask: new ConciergeAgent(),
  RecommendAmenitiesTask: new ConciergeAgent(),

  ProcessPaymentTransactionTask: new BillingAgent(),
  GenerateInvoiceTask: new BillingAgent(),
  CalculateSeasonalRatesTask: new BillingAgent(),
  ProcessRefundTransactionTask: new BillingAgent(),

  GenerateOccupancyReportTask: new OperationsAgent(),
  AuditSystemSecurityLogsTask: new OperationsAgent(),
  BalanceStaffWorkloadTask: new OperationsAgent()
};

class AgentOrchestrator {
  /**
   * Dispatch a task to the appropriate agent.
   * @param {string} taskType
   * @param {object} payload
   * @returns {Promise<{ success: boolean, result: any, error?: string, durationMs: number }>}
   */
  async dispatch(taskType, payload = {}) {
    const agent = agents[taskType];
    if (!agent) {
      const error = `No agent registered for task type '${taskType}'.`;
      console.error(`[Orchestrator] ERROR: ${error}`);
      return { success: false, result: null, error, durationMs: 0 };
    }

    const start = Date.now();
    console.log(`[Orchestrator] START  ${taskType} @ ${new Date(start).toISOString()}`);

    const outcome = await agent.process({ type: taskType, payload });
    const durationMs = Date.now() - start;

    if (outcome.success) {
      console.log(`[Orchestrator] DONE   ${taskType} (+${durationMs}ms)`);
    } else {
      console.error(`[Orchestrator] FAIL   ${taskType} (+${durationMs}ms) — ${outcome.error}`);
    }

    return { ...outcome, durationMs };
  }

  /**
   * Run a predefined autonomous cycle across all domains.
   * shortcut: sequential cycle; upgrade to parallel Promise.all when throughput is needed
   */
  async runAutonomousCycle() {
    const cycle = [
      { taskType: 'GenerateOccupancyReportTask', payload: {} },
      { taskType: 'AuditSystemSecurityLogsTask', payload: { limit: 20 } }
    ];
    const results = [];
    for (const { taskType, payload } of cycle) {
      results.push(await this.dispatch(taskType, payload));
    }
    return results;
  }
}

const orchestrator = new AgentOrchestrator();
module.exports = { AgentOrchestrator, orchestrator };
