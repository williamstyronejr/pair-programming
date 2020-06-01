const {
  createRoom,
  findRoom,
  setRoomToJoinable,
  addUserToRoom,
  markRoomCompleted,
} = require('../room');
const { connectDatabase, disconnectDatabase } = require('../database');

const { DB_TEST_URI } = process.env;

beforeAll(async () => {
  await connectDatabase(DB_TEST_URI);
}, 10000);

afterAll(async () => {
  await disconnectDatabase();
});

describe('Creating room', () => {
  test('Successful create room default parameters', async () => {
    const challengeId = 'testing';
    const users = [];

    const room = await createRoom(challengeId, users);

    expect(room).toBeDefined();
    expect(room.challenge).toBe(challengeId);
    expect(room.users).toHaveLength(users.length);
  }, 10000);

  test('Creating private rooms', async () => {
    const room = await createRoom('id', [], true);

    expect(room.private).toBeTruthy();
  });

  test('Rooms bigger than default size', async () => {
    const size = 20;
    const room = await createRoom('id', [], null, size);

    expect(room.size).toBe(size);
  });
});

describe('Adding users to room', () => {
  const challengeId = 'testing';
  const users = [];
  const isPrivate = false;
  const size = 2;
  const userId = '1';

  let room;

  beforeAll(async () => {
    room = await createRoom(challengeId, users, isPrivate, size);
  });

  test('Adding to empty room', async () => {
    const oldRoom = await addUserToRoom(room.id, userId);

    expect(oldRoom).toBeDefined(); // Returns room only if successful

    const updatedRoom = await findRoom(room.id);

    expect(updatedRoom).toBeDefined();
    expect(updatedRoom.users).toContain(userId);
  });

  test('Adding same user results in no update', async () => {
    const originalRoom = await findRoom(room.id);
    expect(originalRoom).toBeDefined(); // Room was found

    const attemptUpdatedRoom = await addUserToRoom(room.id, userId);
    expect(attemptUpdatedRoom).toBeNull(); // Null meaning update failed

    const updatedRoom = await findRoom(room.id);

    // Room should have the same amount of users
    expect(updatedRoom).toBeDefined();
    expect(updatedRoom.users.length).toBe(originalRoom.users.length);
  });

  test('Users can not be added to a full room', async () => {
    const proms = []; // Array of promises

    for (let i = 0; i < size; i++) {
      proms.push(addUserToRoom(room.id, `user${i}`));
    }

    await Promise.all(proms); // Full room with users

    await addUserToRoom(room.id, `user${size + 1}`);

    const updatedRoom = await findRoom(room.id);

    expect(updatedRoom);
    expect(updatedRoom.users).not.toContain('user3');
  });
});

describe('Updating room', () => {
  const challengeId = '1234';
  let room;

  beforeAll(async () => {
    room = await createRoom(challengeId, []);
  });

  test('Setting room to joinable', async () => {
    const oldRoom = await setRoomToJoinable(room.id);
    expect(oldRoom).toBeDefined(); // Room was found

    const updatedRoom = await findRoom(room.id);

    expect(updatedRoom).toBeDefined(); // Room was found
    expect(updatedRoom.private).toBe(false); // Room is set to joinable
  });

  test('Marking room to be completed', async () => {
    const oldRoom = await markRoomCompleted(room.id);
    expect(oldRoom).toBeDefined(); // Room was found

    const updatedRoom = await findRoom(room.id);

    expect(updatedRoom).toBeDefined(); // Room was found
    expect(updatedRoom.completed).toBeTruthy(); // Room set to completed
  });
});
