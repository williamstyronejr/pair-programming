const { generateToken, findTokenById, deleteToken } = require('../resetToken');
const { connectDatabase, disconnectDatabase } = require('../database');

const { DB_TEST_URI } = process.env;

beforeAll(async () => {
  await connectDatabase(DB_TEST_URI);
});

afterAll(async () => {
  await disconnectDatabase();
});

describe('Creating tokens', () => {
  test('Error thrown when no userId is passed', async () => {
    try {
      const token = await generateToken();
      expect(token).toBeUndefined();
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  test('Create token using userId returns an id and token value', async () => {
    const userId = '123';

    const { id, token } = await generateToken(userId);
    expect(id).toBeDefined();
    expect(token).toBeDefined();

    // Checking for mongoose responding with object
    expect(typeof id).toBe('string');
  });
});

describe('Finding token by id', () => {
  test('Invalid token id will throw error', async () => {
    try {
      await findTokenById('123');
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  test('Successfully finding token by id', async () => {
    const { id, token } = await generateToken('123');
    // Checking for mongoose responding with object
    expect(typeof id).toBe('string');

    const resetToken = await findTokenById(id);
    expect(resetToken).toBeDefined();
  });
});

describe('Deleting token', () => {
  const userId = '123';

  test('Invalid token id with throw error', async () => {
    try {
      await deleteToken('123');
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  test('Successfully deleted token can not be found', async () => {
    const { id, token } = await generateToken(userId);
    await deleteToken(id);

    const resetToken = await findTokenById(id);
    expect(resetToken).toBeNull();
  });
});
