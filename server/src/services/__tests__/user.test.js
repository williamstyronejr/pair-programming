const {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUsers,
  usernameEmailAvailability,
  updateUserPassword,
} = require('../user');
const { connectDatabase, disconnectDatabase } = require('../database');
const { createRandomString } = require('../../utils/utils');

const { DB_TEST_URI } = process.env;

beforeAll(async () => {
  await connectDatabase(DB_TEST_URI);
});

afterAll(async () => {
  await disconnectDatabase();
});

describe('Creating users', () => {
  const username = createRandomString(8);
  const email = createRandomString(8, '@email.com');
  const password = 'password';

  test('Created successfully with all parameter and hashed password', async () => {
    const user = await createUser(username, email, password);

    expect(user.username).toBe(username);
    expect(user.email).toBe(email);
    expect(user.password === password).toBe(false);
  }, 10000);

  test('Usernames are unique', async () => {
    // Assumes a user was already created previously with "username"
    const email2 = createRandomString(8, '@email.com');

    let err;
    let user2;
    try {
      user2 = await createUser(username, email2, password);
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(user2).toBeUndefined();
  }, 10000);

  test('Emails are unique', async () => {
    // Assumes a user was already created previously with "username"
    const username2 = createRandomString(8);

    let user2;
    let err;
    try {
      user2 = await createUser(username2, email, password);
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(user2).toBeUndefined();
  }, 10000);
});

describe('Finding users', () => {
  const username = createRandomString(8);
  const email = createRandomString(8, '@email.com');
  const username2 = createRandomString(8);
  const email2 = createRandomString(8, '@email.com');
  const password = 'password';

  beforeAll(async () => {
    await Promise.all([
      createUser(username, email, password),
      createUser(username2, email2, password),
    ]);
  }, 10000);

  test('By email', async () => {
    const user = await findUserByEmail(email);
    expect(user).toBeDefined();
    expect((user.email = email));
  });

  test('By username', async () => {
    const user = await findUserByUsername(username);
    expect(user).toBeDefined();
    expect(user.username).toBe(username);
  });

  test('Mutilple users at once', async () => {
    const users = await findUsers({});
    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(1);
  });
});

describe('Checking username/email availability', () => {
  const username = createRandomString(8);
  const email = createRandomString(8, '@email.com');
  const password = 'password';

  beforeAll(async () => {
    await createUser(username, email, password);
  }, 10000);

  test('User exists', async () => {
    const user = await usernameEmailAvailability(username, email);

    expect(user).toBeDefined();
    expect(user.username).toBe(username);
  }, 10000);

  test('User does not exists', async () => {
    const user = await usernameEmailAvailability('', '');

    expect(user).toBeNull();
  }, 10000);
});

describe('Updating user', () => {
  let user;
  const username = createRandomString(8);
  const email = createRandomString(8, '@email.com');
  const password = 'pass';

  beforeAll(async () => {
    user = await createUser(username, email, password);
  }, 10000);

  test('Updating password also hashes', async () => {
    const newPassword = 'testing';

    await updateUserPassword(user.id, newPassword);
    const updatedUser = await findUsers({ id: user.id });
    expect(updatedUser.password === user.password).toBeFalsy();
    expect(updatedUser.password === newPassword).toBeFalsy();
  }, 20000);
});
