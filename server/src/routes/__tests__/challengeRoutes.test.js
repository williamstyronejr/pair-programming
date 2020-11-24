const request = require('supertest');
const app = require('../../services/app');
const challengeRoutes = require('../challenge');
const userRoutes = require('../user');
const {
  connectDatabase,
  disconnectDatabase,
} = require('../../services/database');
const { connectAMQP, closeAMQP } = require('../../services/amqp');
const { createRandomString } = require('../../utils/utils');

const { DB_TEST_URI, RABBITMQ_URL } = process.env;

app.use(userRoutes);
app.use(challengeRoutes);

const title = 'title';
const solution = 'solution';
const prompt = 'prompt';
const tags = 'greedy,functions';
const username = createRandomString(8);
const username2 = createRandomString(8);
const username3 = createRandomString(8);
const email = createRandomString(8, '@email.com');
const email2 = createRandomString(8, '@email.com');
const email3 = createRandomString(8, '@email.com');
const password = 'pass';
let challenge;
let userCookie; // Authroization token for user
let userCookie2; // Authroization token for user
let userCookie3; // Authroization token for user

beforeAll(async () => {
  await connectAMQP(RABBITMQ_URL);
  await connectDatabase(DB_TEST_URI);

  await Promise.all([
    request(app)
      .post('/challenge/create')
      .send({ title, prompt, solution, tags })
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        challenge = res.body.challenge;
      }),
    request(app)
      .post('/signup')
      .send({ username, email, password })
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        userCookie = res.headers['set-cookie'][0];
      }),
    request(app)
      .post('/signup')
      .send({ username: username2, email: email2, password })
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        userCookie2 = res.headers['set-cookie'][0];
      }),
    request(app)
      .post('/signup')
      .send({ username: username3, email: email3, password })
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        userCookie3 = res.headers['set-cookie'][0];
      }),
  ]);
}, 12000);

afterAll(async (done) => {
  await disconnectDatabase();

  // Allow time for AMQP to send message
  setTimeout(async () => {
    await closeAMQP();
    done();
  }, 2000);
});

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

describe('/POST /challenge/create', () => {
  const challengeTitle = 'title';
  const challengeSolution = 'solution';
  const challengePrompt = 'prompt';
  const challengeTags = 'greedy,functions';

  test('Successful creates challenge response with challenge object', async () => {
    return request(app)
      .post('/challenge/create')
      .send({
        title: challengeTitle,
        prompt: challengePrompt,
        solution: challengeSolution,
        tags: challengeTags,
      })
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        expect(res.body.challenge).toBeDefined();
        expect(res.body.challenge.title).toBe(challengeTitle);
        expect(res.body.challenge.prompt).toBe(challengePrompt);
        expect(res.body.challenge.solution).toBe(challengeSolution);
        expect(res.body.challenge.tags).toBe(challengeTags);
      });
  });
});

describe('/POST /challenge/:id/create', () => {
  test('Invalid user token throws 401 error', async () => {
    await createRoomRoute('123', '123', 401);
  });

  test('Successfully create room', async () => {
    const challengeId = '123';

    const roomId = await createRoomRoute(challengeId, userCookie);
    expect(roomId).toBeDefined();
  });
});

describe('/GET /challenge/list?page', () => {
  test('Invalid type of page responses with error message', async () => {
    await request(app)
      .get('/challenge/list?page=test')
      .expect(200)
      .then((res) => {
        expect(res.body.error).toBeDefined();
      });
  });

  test('Negative numbers throws a 400 error', async () => {
    await request(app)
      .get(`/challenge/list?page=-1`)
      .expect(400)
      .then((err) => {
        expect(err).toBeDefined();
      });
  });

  test('Successfully get list responses with array', async () => {
    await request(app)
      .get('/challenge/list?page=0')
      .expect(200)
      .then((res) => {
        expect(res).toBeDefined();
        expect(res.body).toBeDefined();
        expect(res.body.challenges).toBeDefined();
        expect(Array.isArray(res.body.challenges)).toBeTruthy();
      });
  });
});

describe('/GET /challenge/:cId/room/:rId', () => {
  let roomId;

  beforeAll(async () => {
    // Create a user, challenge, and room
    roomId = await createRoomRoute(challenge._id, userCookie);
  });

  test('Invalid challengeId throws error', async () => {
    await request(app)
      .get(`/challenge/${challenge._id}1/room/${roomId}`)
      .set('Cookie', userCookie)
      .expect(500)
      .catch((err) => {
        expect(err).toBeDefined();
      });
  });

  test('Invalid roomId throws error', async () => {
    await request(app)
      .get(`/challenge/${challenge._id}/room/${roomId}1`)
      .set('Cookie', userCookie)
      .expect(500)
      .catch((err) => {
        expect(err).toBeDefined();
        expect(err.response).toBeDefined(); // Error came from request
      });
  });

  test('Successfully getting room info should response with room and challenge data', async () => {
    await request(app)
      .get(`/challenge/${challenge._id}/room/${roomId}`)
      .set('Cookie', userCookie)
      .expect(200)
      .then((res) => {
        expect(res.body.room).toBeDefined();
        expect(res.body.challenge).toBeDefined();
      });
  });
});

describe('/POST /room/:rId/public', () => {
  let roomId;

  beforeAll(async () => {
    roomId = await createRoomRoute(challenge._id, userCookie);
  });

  test('Invalid user token will throw 401 error', async () => {
    await makeRoomJoinableRoute(roomId, '1', 401);
  });

  test('User not in room attempting to make room public throws 401 error', async () => {
    await makeRoomJoinableRoute(roomId, userCookie2, 401);
  });

  test('Successfully making room public responses with link', async () => {
    const link = await makeRoomJoinableRoute(roomId, userCookie);
    expect(link).toBeDefined();
  });
});

describe('/POST /invite/:invite', () => {
  let roomId;
  let inviteLink;

  beforeAll(async () => {
    roomId = await createRoomRoute(challenge._id, userCookie);
    const link = await makeRoomJoinableRoute(roomId, userCookie);
    inviteLink = `/invite/${link}`;
  }, 10000);

  test('Invalid link throws 500 error', async () => {
    await request(app)
      .post(`${inviteLink}1`)
      .set('Cookie', userCookie2)
      .expect(500)
      .catch((err) => {
        expect(err).toBeDefined();
        expect(err.response).toBeDefined(); // Error came from request
      });
  });

  test('Successfully joining the room response with link', async () => {
    await request(app)
      .post(inviteLink)
      .set('Cookie', userCookie2)
      .expect(200)
      .then((res) => {
        expect(res).toBeDefined();
        expect(res.body).toBeDefined();
        expect(res.body.link).toBeDefined();
      });
  });

  test('Joining a room a user is already in will response with link', async () => {
    await request(app)
      .post(inviteLink)
      .set('Cookie', userCookie2)
      .expect(200)
      .then((res) => {
        expect(res).toBeDefined();
        expect(res.body).toBeDefined();
        expect(res.body.link).toBeDefined();
      });
  });

  test('Attempting to join a full room throws a 500 error', async () => {
    await request(app)
      .post(inviteLink)
      .set('Cookie', userCookie3)
      .expect(500)
      .catch((err) => {
        expect(err).toBeDefined();
        expect(err.response).toBeDefined(); // Error came from request
      });
  });
});

describe('/POST /challenge/:cId/room/:rId/test', () => {
  const routeToTest = (cId, rId) => `/challenge/${cId}/room/${rId}/test`;
  let roomId;

  // Create a new room
  beforeAll(async () => {
    roomId = await createRoomRoute(challenge._id, userCookie);
  });

  test('Non-existing params will throw 400 error with error messages', async () => {
    await request(app)
      .post(routeToTest('dnjs', roomId))
      .set('Cookie', userCookie)
      .expect(400)
      .catch((err) => {
        expect(err).toBeDefined();
        expect(err.response.data.code).toBeDefined();
        expect(err.response.data.lang).toBeDefined();
      });
  });

  test('Invalid challengeId should throw 400 error with message', async () => {
    const code = 'function main(num, power) { return Math.pow(num, power); }';
    const lang = 'node';
    const invalidChallengeId = 'index';

    await request(app)
      .post(routeToTest(invalidChallengeId, roomId))
      .set('Cookie', userCookie)
      .send({ code, lang })
      .expect(422)
      .catch((err) => {
        expect(err).toBeDefined();
        expect(err.response.data).toBeDefined();
      });
  });

  test('Successfully request should response 200 with success message', async () => {
    const code = 'function main(num, power) { return Math.pow(num, power); }';
    const lang = 'node';

    const res = await request(app)
      .post(routeToTest(challenge._id, roomId))
      .set('Cookie', userCookie)
      .send({ code, lang })
      .expect(200);

    expect(res).toBeDefined();
    expect(res.body.success).toBeTruthy();
  });
});
