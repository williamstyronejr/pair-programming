const schedule = require('node-schedule');
const { checkActiveQueues } = require('./challengeQueue');

let schedulerQueue;

/**
 * Sets up a scheduled job to run every 5 sceonds to check for active queues.
 */
exports.setUpChallengeQueue = () => {
  // Executes every 5 seconds
  schedulerQueue = schedule.scheduleJob('*/5 * * * * *', checkActiveQueues);
};

/**
 * Stops schedule job for queue.
 */
exports.cancelQueue = () => {
  schedule.cancelJob(schedulerQueue);
};
