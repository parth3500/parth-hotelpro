'use strict';
const { TaskRunner } = require('./taskRunner');
const bookingTasks = require('./bookingTasks');
const housekeepingTasks = require('./housekeepingTasks');
const conciergeTasks = require('./conciergeTasks');
const billingTasks = require('./billingTasks');
const operationsTasks = require('./operationsTasks');

module.exports = {
  TaskRunner,
  bookingTasks,
  housekeepingTasks,
  conciergeTasks,
  billingTasks,
  operationsTasks
};
