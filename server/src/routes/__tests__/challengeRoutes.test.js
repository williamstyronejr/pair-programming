const request = require('supertest');
const app = require('../../services/app');
const challengeRoutes = require('../challenge');
const userRoutes = require('../user');
const {
  connectDatabase,
  disconnectDatabase,
} = require('../../services/database');
const { createRandomString } = require('../../utils/utils');

const { DB_TEST_URI } = process.env;

app.use(userRoutes);
app.use(challengeRoutes);

beforeAll(async () => {
  await connectDatabase(DB_TEST_URI);
});

afterAll(async () => {
  await disconnectDatabase();
});

/**
 * Creates a request for creating a new user and returns the user's JWT.
 * @param {string} username Username for new user
 * @param {string} email Email for new user
 * @param {string} password password for new user
 * @param {number} status Expected status code to receive
 * @return {Promise<string>} A promise to resolve with the user's JWT.
 */
function createUserRoute(username, email, password, status = 200) {
  return request(app)
    .post('/signup')
    .send({ username, email, password })
    .set('Accept', 'application/json')
    .expect(status)
    .then((res) => res.headers['set-cookie'][0]);
}

/**
 * Creates a request for creating a challenge and returns an object containing
 *  the new challenge's data.
 * @param {string} title Title for challenge
 * @param {string} prompt Prompt for challenge
 * @param {string} solution Solution to challenge
 * @param {number} status Expected status code from response.
 * @return {Promise<object>} A promise to resolve with a challenge object.
 */
function createChallengeRoute(title, prompt, solution, status = 200) {
  return request(app)
    .post('/challenge/create')
    .send({ title, prompt, solution })
    .set('Accept', 'application/json')
    .expect(status)
    .then((res) => res.body.challenge);
}

/**
 * Creates a request for creating a room and returns a id of the room.
 * @param {string} challengeId Id of challenge to create room for
 * @param {String} userCookie Cookie containing auth JWT for user
 * @param {number} status Expected status code for response.
 * @return {Promise<string>} A promise to resolve with the id of the room.
 */
function createRoomRoute(challengeId, cookie, status = 200) {
  return request(app)
    .post(`/challenge/${challengeId}/create`)
    .set('Cookie', cookie)
    .expect(status)
    .then((res) => res.body.room);
}

/**
 * Creates a request to make a room joinable and returns a invite link.
 * @param {stirng} roomId Id of room to make joinable
 * @param {string} cookie Cookie containing auth JWT for user
 * @param {number} status Expected status code
 * @return {Promise<string>} A promise to resolve with the invite link.
 */
function makeRoomJoinableRoute(roomId, cookie, status = 200) {
  return request(app)
    .post(`/room/${roomId}/public`)
    .set('Cookie', cookie)
    .expect(status)
    .then((res) => res.body.invite);
}

describe('/POST create challenge', () => {
  const title = 'title';
  const solution = 'solution';
  const prompt = 'prompt';

  test('Successful creates challenge response with challenge object', async () => {
    const challenge = await createChallengeRoute(title, prompt, solution);
    expect(challenge).toBeDefined();
    expect(challenge.title).toBe(title);
    expect(challenge.prompt).toBe(prompt);
    expect(challenge.solution).toBe(solution);
  });
});

describe('/POST creating room', () => {
  let userCookie; // Authroization cookie for user

  beforeAll(async () => {
    const username = createRandomString(8);
    const email = createRandomString(8, '@email.com');
    const password = 'pass';

    userCookie = await createUserRoute(username, email, password);
  }, 20000);

  test('Invalid user token throws 401 error', async () => {
    await createRoomRoute('123', '123', 401);
  });

  test('Successfully create room', async () => {
    const challengeId = '123';

    const roomId = await createRoomRoute(challengeId, userCookie);
    expect(roomId).toBeDefined();
  });
});

describe('/GET get challenge list', () => {
  const numOfChallenges = 20; // Will create this many challenges

  // Max size of list to receive from request
  const maxListSize = numOfChallenges > 10 ? 10 : numOfChallenges;

  beforeAll(async () => {
    const title = 'title';
    const prompt = 'prompt';
    const solution = 'test';

    const proms = [];

    for (let i = 0; i < numOfChallenges; i++) {
      proms.push(
        createChallengeRoute(`${title}${i}`, `${prompt}${i}`, solution)
      );
    }

    await Promise.all(proms);
  }, 10000 * numOfChallenges);

  /**
   * Creates a request to get a list of challenges.
   * @param {number} page Page number to skip challenges.
   * @param {number} status Expected status code from response
   * @return {Promise<Array>} A promise to resolve with an array of challenge
   *  objects or an empty if no challenges are found.
   */
  function getListRoute(page = 0, status = 200) {
    return request(app)
      .get(`/challenge/list?page=${page}`)
      .expect(status)
      .then((res) => res.body);
  }

  test('Invalid type of page responses with error message', async () => {
    const body = await getListRoute('tset');
    expect(body.error).toBeDefined();
  });

  test('Negative numbers throws a 400 error', async () => {
    await getListRoute(-1, 400);
  });

  test('Successfully get list responses with array', async () => {
    const list = await getListRoute();

    expect(list).toBeDefined();
    expect(Array.isArray(list)).toBeTruthy();
    expect(list.length).toBe(maxListSize);
  });
});

describe('/GET get room information', () => {
  let userCookie; // Authroization token for user
  let challengeId;
  let roomId;

  beforeAll(async () => {
    // Create a user, challenge, and room
    const username = createRandomString(8);
    const email = createRandomString(8, '@email.com');
    const password = 'pass';
    const challengeTitle = 'titleweqe';
    const challengePrompt = 'prompt';
    const challengeSolution = 'solution';

    userCookie = await createUserRoute(username, email, password);

    const challenge = await createChallengeRoute(
      challengeTitle,
      challengePrompt,
      challengeSolution
    );
    challengeId = challenge._id;

    roomId = await createRoomRoute(challengeId, userCookie);
  }, 30000);

  /**
   * Creates a request for getting data of room and returns the
   *  room and challenge data.
   * @param {string} cId Id of the challenge for the room
   * @param {string} rId Id of room to get infomation for
   * @param {number} status Expected status code for response
   * @return {Promise<object>} A promise to resolve with a object of room and
   *  challenge data.
   */
  function getRoomInfoRequest(cId, rId, status = 200) {
    return request(app)
      .get(`/challenge/${cId}/room/${rId}`)
      .set('Cookie', userCookie)
      .expect(status)
      .then((res) => res.body);
  }

  test('Invalid challengeId throws error', async () => {
    await getRoomInfoRequest(`${challengeId}1`, roomId, 500);
  });

  test('Invalid roomId throws error', async () => {
    await getRoomInfoRequest(challengeId, `${roomId}1`, 500);
  });

  test('Successfully getting room info response with room and challenge data', async () => {
    const data = await getRoomInfoRequest(challengeId, roomId);
    expect(data.room).toBeDefined();
    expect(data.challenge).toBeDefined();
  });
});

describe('/POST make room public', () => {
  let user1Cookie; // Authroization token for user
  let user2Cookie; // Authroization token for user
  let roomId;

  beforeAll(async () => {
    // Create a 2 users and room
    const username1 = createRandomString(8);
    const email1 = createRandomString(8, '@email.com');
    const username2 = createRandomString(8);
    const email2 = createRandomString(8, '@email.com');
    const password = 'pass';
    const challengeId = '123';

    [user1Cookie, user2Cookie] = await Promise.all([
      createUserRoute(username1, email1, password),
      createUserRoute(username2, email2, password),
    ]);

    roomId = await createRoomRoute(challengeId, user1Cookie);
  }, 20000);

  test('Invalid user token will throw 401 error', async () => {
    await makeRoomJoinableRoute(roomId, '1', 401);
  });

  test('User not in room attempting to make room public throws 401 error', async () => {
    await makeRoomJoinableRoute(roomId, user2Cookie, 401);
  });

  test('Successfully making room public responses with link', async () => {
    const link = await makeRoomJoinableRoute(roomId, user1Cookie);
    expect(link).toBeDefined();
  });
});

describe('/POST joining room by invite', () => {
  let user1Cookie; // Authroization token for user
  let user2Cookie; // Authroization token for user
  let user3Cookie; // Authroization token for user
  let roomId;
  let inviteLink;

  beforeAll(async () => {
    // Create 3 users and a private room with invite link
    const username1 = createRandomString(8);
    const username2 = createRandomString(8);
    const username3 = createRandomString(8);
    const email1 = createRandomString(8, '@email.com');
    const email2 = createRandomString(8, '@email.com');
    const email3 = createRandomString(8, '@email.com');
    const password = 'pass';
    const challengeId = '123';

    [user1Cookie, user2Cookie, user3Cookie] = await Promise.all([
      createUserRoute(username1, email1, password),
      createUserRoute(username2, email2, password),
      createUserRoute(username3, email3, password),
    ]);

    roomId = await createRoomRoute(challengeId, user1Cookie);
    const link = await makeRoomJoinableRoute(roomId, user1Cookie);
    inviteLink = `/invite/${link}`;
  }, 40000);

  /**
   * Creates a request for current user to join a room. If successfully, will
   *  return the link to the room.
   * @param {string} route Route to send the request to
   * @param {string} cookie Cookie for user that is going to join the room
   * @param {number} status Expected status code for response
   * @return {Promise<string>} A promise to resolve with a link to the room.
   */
  function joinRoomRoute(route, cookie, status = 200) {
    return request(app)
      .post(route)
      .set('Cookie', cookie)
      .expect(status)
      .then((res) => res.body.link)
      .catch((err) => {
        throw err;
      });
  }

  test('Invalid link throws 500 error', async () => {
    await joinRoomRoute(`${inviteLink}1`, user2Cookie, 500);
  });

  test('Successfully joining the room response with link', async () => {
    const roomLink = await joinRoomRoute(inviteLink, user2Cookie);
    expect(roomLink).toBeDefined();
  });

  test('Joining a room a user is already in will response with link', async () => {
    const roomLink = await joinRoomRoute(inviteLink, user2Cookie);
    expect(roomLink).toBeDefined();
  });

  test('Attempting to join a full room throws a 500 error', async () => {
    await joinRoomRoute(inviteLink, user3Cookie, 500);
  });
});
