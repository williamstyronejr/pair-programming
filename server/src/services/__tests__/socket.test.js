const http = require('http');
const io = require('socket.io-client');
// const { startServer, closeServer } = require('../server');
const {
  setupSocket,
  closeSocket,
  emitMessageToRoom,
  emitMessageToUserId,
} = require('../socket');
const {
  setupRedis,
  closeRedis,
  getQueueSize,
  addUsersToPendingQueue,
  getPendingQueue,
} = require('../redis');
const {
  connectDatabase,
  disconnectDatabase,
} = require('../../services/database');

const { DB_TEST_URI, SERVER_IP: IP, SERVER_PORT: PORT } = process.env;

const server = http.createServer();
let redisClient;
let socket1; // Client socket to emulate a user
let socket2; // Client socket to emulate a user
let socket3; // Client socket used for attacking (breaking) system attempts
const socketUserId1 = 'user1';
const socketUserId2 = 'user2';
const attackUserId = 'user3'; // Id of user trying to force an action on system

// Set up fake server, redis, and socket.io, and mongoose
beforeAll(async (done) => {
  redisClient = await setupRedis();
  server.listen(PORT, IP, async () => {
    setupSocket(server);
    await connectDatabase(DB_TEST_URI);
    done();
  });
});

// Close connections
afterAll(async (done) => {
  closeSocket();
  closeRedis();
  await disconnectDatabase();
  server.close(done());
});

// Connect client sockets to server
beforeEach((done) => {
  // Brackets need for IPv6
  socket1 = io.connect(`http://${IP}:${PORT}`, {
    transports: ['websocket'],
  });
  socket2 = io.connect(`http://${IP}:${PORT}`, {
    transports: ['websocket'],
  });

  // Connect sockets and emit message for logging user ids with sockets
  socket1.on('connect', () => {
    socket1.on('userLogged', () => {
      if (socket2.connected) done();
    });
    socket1.emit('logUser', socketUserId1);
  });

  socket2.on('connect', () => {
    socket2.on('userLogged', () => {
      if (socket1.connected) done();
    });
    socket2.emit('logUser', socketUserId2);
  });
});

// Disconnect all sockets and clear redis
afterEach((done) => {
  // Discoonect all client sockets
  redisClient.flushall();
  if (socket1) socket1.disconnect();
  if (socket2) socket2.disconnect();
  if (socket3) socket3.disconnect();
  done();
});

describe('Connecting socket', () => {
  test('Successful conencted', () => {
    expect(socket1.connected).toBeTruthy();
    expect(socket2.connected).toBeTruthy();
  });
});

describe('Joining/Leaving queue through socket', () => {
  const queueId = 'queueId';
  const userId = 'user1';

  test('Successfully joining the queue', (done) => {
    socket1.emit('joinQueue', queueId, userId);

    setTimeout(async () => {
      const count = await getQueueSize(queueId);
      expect(count).toBe(1);
      done();
    }, 100);
  });

  test('Successfully leaving the queue', (done) => {
    socket2.emit('leaveQueue', queueId, userId);

    setTimeout(async () => {
      const count = await getQueueSize(queueId);
      expect(count).toBe(0);
      done();
    }, 100);
  });
});

describe('Accepting/Declining pending queue', () => {
  const pendingQueue = 'pending-4';

  beforeEach(async () => {
    await addUsersToPendingQueue(pendingQueue, [socketUserId1, socketUserId2]);
  });

  test('Acceptting queue user is not apart of changes nothing', async (done) => {
    socket3 = io.connect(`http://${IP}:${PORT}`, {
      transports: ['websocket'],
    });

    // Connect sockets and emit message for logging user ids with sockets
    socket3.on('connect', () => {
      socket3.on('userLogged', () => {
        // Try to accept queue,
        socket3.emit('acceptMatch', attackUserId);

        setTimeout(async () => {
          const queue = await getPendingQueue(pendingQueue);

          expect(queue).toBeDefined();
          expect(queue[attackUserId]).toBeUndefined();
          expect(queue[socketUserId1]).toBe('false');
          expect(queue[socketUserId2]).toBe('false');

          done();
        });
      });
      socket3.emit('logUser', socketUserId1);
    });
  });

  test('Successfully accept queue', async (done) => {
    socket1.emit('acceptMatch', pendingQueue);

    setTimeout(async () => {
      const queue = await getPendingQueue(pendingQueue);

      expect(queue).toBeDefined();
      expect(queue[socketUserId1]).toBe('true');
      expect(queue[socketUserId2]).toBe('false');

      done();
    }, 100);
  });

  test('All users accepting queue removes queue, creates room, and emits to clients', async (done) => {
    socket1.on('roomCreated', async (roomId) => {
      const queue = await getPendingQueue(pendingQueue);

      expect(queue).toBeNull(); // Queue no longer exists
      expect(roomId).toBeDefined(); // Room id was provided
      done();
    });

    socket1.emit('acceptMatch', pendingQueue);
    socket2.emit('acceptMatch', pendingQueue);
  });
});

describe('Joining and leaving room', () => {
  const pendingQueue = 'pendingqueue2';
  let roomId;

  beforeEach(async (done) => {
    // Event handler for room creation
    socket1.on('roomCreated', (rId) => {
      roomId = rId;

      // Join room
      socket1.emit('joinRoom', roomId, socketUserId1);
      socket2.emit('joinRoom', roomId, socketUserId2);

      // Allow sockets to join room
      setTimeout(() => {
        done();
      }, 200);
    });

    // Add users to pending queue
    await addUsersToPendingQueue(pendingQueue, [socketUserId1, socketUserId2]);

    // Users accept queue
    socket1.emit('acceptMatch', pendingQueue);
    socket2.emit('acceptMatch', pendingQueue);
  });

  test('Successfully joining room', async (done) => {
    const event = 'event';
    const message = 'test';
    let messageCounter = 0;

    socket1.on(event, (msg) => {
      expect(msg).toBe(message);
      messageCounter += 1;
      if (messageCounter === 2) done();
    });

    socket2.on(event, (msg) => {
      expect(msg).toBe(message);
      messageCounter += 1;
      if (messageCounter === 2) done();
    });

    emitMessageToRoom(event, roomId, message);
  });

  test('Successfully leaving room', async (done) => {
    socket2.on('leaveMessage', (msg) => {
      expect(msg).toBeDefined();
      expect(msg.includes(socketUserId1)).toBeTruthy();
      done();
    });

    socket1.emit('leaveRoom', roomId, socketUserId1);
  });
});

describe('Sending message in room', () => {
  const pendingQueue = 'pendingqueue55';
  let roomId;

  beforeEach(async (done) => {
    // Event handler for room creation
    socket1.on('roomCreated', (rId) => {
      roomId = rId;

      // Join room
      socket1.emit('joinRoom', roomId, socketUserId1);
      socket2.emit('joinRoom', roomId, socketUserId2);

      // Allow sockets to join room
      setTimeout(() => {
        done();
      }, 300);
    });

    // Add users to pending queue
    await addUsersToPendingQueue(pendingQueue, [socketUserId1, socketUserId2]);

    // Users accept queue
    socket1.emit('acceptMatch', pendingQueue);
    socket2.emit('acceptMatch', pendingQueue);
  });

  test('User in socket sending message to room', (done) => {
    const message = 'test';
    const timestamp = Date.now();

    socket2.on('receiveMessage', (msg, time) => {
      expect(msg).toBe(message);
      expect(time).toBe(time);

      done();
    });

    socket1.emit('sendMessage', roomId, message, timestamp);
  });

  test('Socket sending code to other sockets in room', async (done) => {
    const codeSent = 'this is code to be sent';

    socket2.on('receiveCode', (codeReceived) => {
      expect(codeSent).toBe(codeReceived);
      done();
    });

    socket1.emit('sendCode', roomId, codeSent);
  });
});

describe('Emitting messages', () => {
  test('Emitting message to user', (done) => {
    const message = 'Message being sent';
    const event = 'test';

    socket2.on(event, (msg) => {
      expect(msg).toBe(message);
      done();
    });

    emitMessageToUserId(event, socketUserId2, message);
  });

  test('Emitting multi-variable messages to user', (done) => {
    const arg1 = 123;
    const arg2 = 'testing';
    const event = 'event';

    socket2.on(event, (d1, d2) => {
      expect(d1).toBe(arg1);
      expect(d2).toBe(arg2);

      done();
    });

    emitMessageToUserId(event, socketUserId2, arg1, arg2);
  });

  test('Emitting a message to a room', (done) => {
    const message = 'Message to be sent';
    const roomId = 'roomId';
    const event = 'test';
    const username = 'username';

    // Join room
    socket1.emit('joinRoom', roomId, username);

    socket1.on(event, (msg) => {
      expect(msg).toBe(message);
      done();
    });

    // Give time for socket to handshake
    setTimeout(() => {
      emitMessageToRoom(event, roomId, message);
    }, 100);
  });

  test('Emitting multi-variable messages to room', (done) => {
    const message = 'Message to be sent';
    const arg1 = 123;
    const arg2 = 'test';
    const roomId = 'roomId';
    const event = 'test';
    const username = 'username';

    // Join room
    socket1.emit('joinRoom', roomId, username);

    socket1.on(event, (d1, d2) => {
      expect(arg1).toBe(d1);
      expect(arg2).toBe(d2);
      done();
    });

    // Give time for socket to handshake
    setTimeout(() => {
      emitMessageToRoom(event, roomId, arg1, arg2);
    }, 100);
  });
});
