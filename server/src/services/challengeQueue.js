const crypto = require('crypto');
const {
  activeQueue,
  popUsersFromQueue,
  addUsersToPendingQueue
} = require('./redis');
const { emitMessageToUserId } = require('./socket');

let inProgress = false; // Flag to prevent running queue parallel

/**
 * Notifies users through socket to
 * @param {string} queueId Id of pending queue
 * @param {Array} users Array of user ids to send the queuePop notification to
 */
function notifyUsers(queueId, users) {
  users.forEach(userId => {
    emitMessageToUserId('matchFound', userId, queueId);
  });
}

/**
 * Creates matches for a given queue and adds the users into a separate pending
 *  queue. If a queue is determined to not have enough users, it will be
 *  removed from the active queue list.
 * @param {string} queueId Id of queue to get users from
 * @param {number} numOfUsers Number of users to match in queue
 * @return {Promise} A promise to resolve with the id of pending queue if
 *  created, otherwise with null.
 */
async function createMatch(queueId, numOfUsers) {
  const users = await popUsersFromQueue(queueId, numOfUsers);

  // Operation was interrupted (Queue may still have enough users)
  if (users == null) return null;

  // Not enough users, remove queue from active list
  if (users.length === 0) {
    delete activeQueue[queueId];
    return null;
  }

  // Unique id for match
  const pendingQueueId = crypto.pseudoRandomBytes(16).toString('hex');

  // Attempt to add users to a pending queue
  return addUsersToPendingQueue(pendingQueueId, users).then(result => {
    if (result == null) return null;
    notifyUsers(pendingQueueId, users);
    return pendingQueueId;
  });
}

/**
 * Attempts to form matches with every active queue. Uses a flag to prevent
 *  running queues in parallel.
 * @return {Promise<array>} A promise to resolve with an array containing either
 *  null or pending queue Id values for each queue listed in activeQueue.
 */
exports.checkActiveQueues = () => {
  if (inProgress) return false;

  inProgress = true; // To stop queues from running in parallel

  const proms = [];

  Object.entries(activeQueue).forEach(([queueId, value]) => {
    proms.push(createMatch(queueId, value));
  });

  return Promise.all(proms).then(results => {
    inProgress = false;
    return results;
  });
};
