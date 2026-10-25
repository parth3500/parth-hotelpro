'use strict';
const fs = require('fs');
const path = require('path');
const { orchestrator } = require('../agents/agentOrchestrator');

const STATE_PATH = path.join(__dirname, 'STATE.md');

// shortcut: sequential processing; upgrade to parallel workers when load requires
class TaskRunner {
  constructor() {
    this.queue = []; // in-memory task queue
    this.running = false;
    this.log = [];   // execution telemetry
  }

  /**
   * Add a task to the queue.
   * @param {{ type: string, payload: object, id?: string }} task
   */
  enqueue(task) {
    const entry = {
      id: task.id || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: task.type,
      payload: task.payload || {},
      status: 'pending',
      enqueuedAt: new Date().toISOString()
    };
    this.queue.push(entry);
    return entry.id;
  }

  /**
   * Process all queued tasks sequentially, updating STATE.md after each.
   */
  async run() {
    if (this.running) return; // guard against re-entry
    this.running = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      task.status = 'running';
      task.startedAt = new Date().toISOString();
      console.log(`[TaskRunner] Running ${task.id} (${task.type})`);

      const outcome = await orchestrator.dispatch(task.type, task.payload);

      task.status = outcome.success ? 'completed' : 'failed';
      task.finishedAt = new Date().toISOString();
      task.durationMs = outcome.durationMs;
      task.error = outcome.error || null;

      this.log.push({ ...task, result: outcome.result });
      this._updateState();
    }

    this.running = false;
  }

  _updateState() {
    const completed = this.log.filter(t => t.status === 'completed').length;
    const failed    = this.log.filter(t => t.status === 'failed').length;
    const pending   = this.queue.length;
    const total     = completed + failed + pending;
    const pct       = total > 0 ? Math.round((completed / total) * 100) : 100;

    const lines = [
      '# HotelPro — Task Runner State',
      '',
      `**Last updated:** ${new Date().toISOString()}`,
      `**Progress:** ${pct}%  (${completed} completed / ${failed} failed / ${pending} pending)`,
      '',
      '## Completed',
      ...this.log.filter(t => t.status === 'completed').map(
        t => `- ✅ \`${t.id}\` **${t.type}** — ${t.durationMs}ms`
      ),
      '',
      '## Failed',
      ...this.log.filter(t => t.status === 'failed').map(
        t => `- ❌ \`${t.id}\` **${t.type}** — ${t.error}`
      ),
      '',
      '## Pending',
      ...this.queue.map(t => `- ⏳ \`${t.id}\` **${t.type}**`),
      ''
    ];

    fs.writeFileSync(STATE_PATH, lines.join('\n'), 'utf8');
  }
}

module.exports = { TaskRunner };
