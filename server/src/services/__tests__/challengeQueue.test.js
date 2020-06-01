const { checkActiveQueues } = require('../challengeQueue');
const {
  setupRedis,
  closeRedis,
  addUserToQueue,
  getPendingQueue,
  activeQueue,
} = require('../redis');

let redisClient;

const { REDIS_HOST, REDIS_PORT } = process.env;

beforeAll(async () => {
  redisClient = await setupRedis(REDIS_HOST, REDIS_PORT);
});

afterAll(() => {
  closeRedis();
});

describe('Running queue with one active queue', () => {
  const userId1 = 'user1';
  const userId2 = 'user2';
  const queueId2 = 'queueId2';
  const queueId3 = 'queueId3';

  afterEach(async () => {
    await redisClient.flushall();
  });

  test('Queue will not be made if not enough users exists', async () => {
    await addUserToQueue(queueId3, userId1, 3);
    await addUserToQueue(queueId3, userId2, 3);
    const pendingQueueIds = await checkActiveQueues();

    expect(pendingQueueIds[0]).toBeNull();
  });

  test('Creating pending queue will result in hash with userIds', async () => {
    await addUserToQueue(queueId2, userId1);
    await addUserToQueue(queueId2, userId2);

    const pendingQueueIds = await checkActiveQueues();
    expect(Array.isArray(pendingQueueIds)).toBeTruthy();
    expect(pendingQueueIds).toHaveLength(1);
    expect(pendingQueueIds[0]).not.toBeNull(); // Makes sure that id was returned

    const results = await getPendingQueue(pendingQueueIds[0]);

    expect(results).toBeDefined();
    expect(results[userId1]).toBe('false');
    expect(results[userId2]).toBe('false');
  });
});
