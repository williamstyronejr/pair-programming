const {
  setupRedis,
  getQueueSize,
  addUserToQueue,
  removeUserFromQueue,
  popUsersFromQueue,
  markUserAsAccepted,
  addUsersToPendingQueue,
  getPendingQueue,
  activeQueue,
} = require('../redis');

let redisClient;
const { REDIS_HOST, REDIS_PORT } = process.env;

// Setup redis client
beforeAll(async () => {
  redisClient = await setupRedis(REDIS_HOST, REDIS_PORT);
});

// Close Redis client
afterAll((done) => {
  if (redisClient) {
    redisClient.quit();
  }
  done();
});

afterEach(async () => {
  await redisClient.flushall(); // Clear redis data after every test
});

const queueId = 'queue';
const userId = 'userid';

test('Adding user to queue should add queue to active list', async () => {
  let count = await getQueueSize(queueId);
  expect(count).toBe(0); // Queue should start empty

  await addUserToQueue(queueId, userId);
  count = await getQueueSize(queueId);
  expect(count).toBe(1); // Queue should have one user
  expect(activeQueue[queueId]).toBeDefined(); // Queue is added to active list
});

test('Removing user from queue', async () => {
  await addUserToQueue(queueId, userId);
  let count = await getQueueSize(queueId);
  expect(count).toBe(1);

  await removeUserFromQueue(queueId, userId);
  count = await getQueueSize(queueId, userId);
  expect(count).toBe(0);
});

describe('Popping users from queue', () => {
  const max = 2;

  beforeEach((done) => {
    addUserToQueue(queueId, userId).then(done());
  });

  test('Not enough users returns null without popping users', async () => {
    const results = await popUsersFromQueue(queueId, max);
    expect(results).toHaveLength(0);

    // User was not popped
    const count = await getQueueSize(queueId);
    expect(count).toBe(1);
  });

  test('Queue has enough users', async () => {
    const promises = [];
    // Loop to add users user till defined max
    for (let i = 0; i < max - 1; i += 1) {
      promises.push(addUserToQueue(queueId, `user${i}`));
    }
    await Promise.all(promises);

    const results = await popUsersFromQueue(queueId, max);
    expect(results).toHaveLength(max);
  });
});

describe('Handling user responses to queue pairs', () => {
  const userId1 = 'user1';
  const userId2 = 'user2';
  const challengeId = 'challengeId';
  const pendingQueueId = 'randomstring';

  beforeEach(() => {
    addUsersToPendingQueue(pendingQueueId, [userId1, userId2]);
  });

  test('Wrong user trying to accept queue', async (done) => {
    const wrongUser = 'user';
    const result = await markUserAsAccepted(pendingQueueId, wrongUser);
    expect(result).toBe(null); // Queue is not ready for room creation

    // Get pending queue and check if both users are false
    const pendingQueue = Object.values(await getPendingQueue(pendingQueueId));
    expect(pendingQueue).not.toContain('true');
    done();
  });

  test('Both users accepting queue', async () => {
    const user1Reply = await markUserAsAccepted(pendingQueueId, userId1);
    const user2Reply = await markUserAsAccepted(pendingQueueId, userId2);

    expect(user1Reply).toBe(null);
    expect(user2Reply).toEqual([userId1, userId2]);
  });
});
