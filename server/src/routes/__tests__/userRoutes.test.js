const request = require('supertest');
const app = require('../../services/app');
const userRouter = require('../user');
const { sendEmailTemplate } = require('../../services/emailer');
const {
  connectDatabase,
  disconnectDatabase,
} = require('../../services/database');
const { createRandomString } = require('../../utils/utils');

const { SERVER_IP: IP, SERVER_PORT: PORT, DB_TEST_URI } = process.env;

// Mocked to prevent sending emails during testing
jest.mock('../../services/emailer');

app.use(userRouter);

beforeAll(async () => {
  await connectDatabase(DB_TEST_URI);
});

afterAll(async () => {
  await disconnectDatabase();
});

beforeEach(() => {
  // Reset mocks
  sendEmailTemplate.mockClear();
});

/**
 * Creates and returns a request to create user with provided params.
 * @param {string} username Username for new user
 * @param {string} email Email for new user
 * @param {string} password Password for new user
 * @return {Promise<object>} A promise to resolve with a response object.
 */
function createUserRoute(username, email, password) {
  return request(app)
    .post('/signup')
    .send({ username, email, password })
    .set('Accept', 'application/json')
    .expect(200);
}

/**
 * Creates and returns a request to log a user in.
 * @param {string} username Username to use to signin
 * @param {string} password Password to use to signin
 * @param {number} status Expected status code to receive
 * @return {Promise<object>} A promise to resolve with a response object.
 */
function signinRoute(username, password, status = 200) {
  return request(app)
    .post('/signin')
    .send({ username, password })
    .set('Accept', 'application/json')
    .expect(status);
}

/**
 * Creates and returns a request to send a password reset email.
 * @param {string} field A username/email of user to send reset email to
 * @param {number} status Expected stauts code to receive from request
 * @return {Promise<object>} A promise to resolve with a response object.
 */
function emailRecoveryRoute(field, status = 200) {
  return request(app)
    .post('/account/recovery/password')
    .send({ field })
    .set('Accept', 'application/json')
    .expect(status);
}

describe('GET/ input validator', () => {
  test('Empty data response with no errors', async () => {
    await request(app)
      .post('/inputvalidator')
      .send({})
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        expect(res.body.success).toBeTruthy();
      });
  });

  test('Invalid username responses with error', async () => {
    const username = '';
    await request(app)
      .post('/inputvalidator')
      .send({ username })
      .expect(400)
      .catch((err) => {
        expect(err.errors).toBeDefined();
        expect(err.errors.username).toBeDefined();
      });
  });

  test('Invalid email responses with error', async () => {
    const email = '';
    await request(app)
      .post('/inputvalidator')
      .send({ email })
      .expect(400)
      .catch((err) => {
        expect(err.errors).toBeDefined();
        expect(err.errors.email).toBeDefined();
      });
  });
});

describe('/POST user signup', () => {
  const username = createRandomString(8);
  const email = createRandomString(8, '@email.com');
  const password = 'pass';

  test('Successfully signup sets JWT in cookie', async () => {
    await request(app)
      .post('/signup')
      .send({ username, email, password })
      .expect(200)
      .then((res) => {
        expect(res.headers['set-cookie']).toBeDefined();
        expect(res.headers['set-cookie'][0].includes('token')).toBeTruthy();
      });
  }, 10000);

  test('Signup with a used username throws 400', async () => {
    // Requires a users to be created in previous test
    await request(app)
      .post('/signup')
      .send({ username, email: `e${email}`, password })
      .set('Accept', 'application/json')
      .expect(400)
      .catch((err) => {
        expect(err.body.errors).toBeDefined();
        expect(err.body.errors.username).toBeDefined();
        expect(err.body.errors.email).not.toBeDefined();
      });
  });

  test('Signup with a used email throws 400', async () => {
    // Requires a users to be created in previous test
    await request(app)
      .post('/signup')
      .send({ username: `u${username}`, email, password })
      .set('Accept', 'application/json')
      .expect(400)
      .catch((err) => {
        expect(err.body.errors).toBeDefined();
        expect(err.body.errors.email).toBeDefined();
        expect(err.body.errors.username).not.toBeDefined();
      });
  });

  test('Signing up as with invalid data throw 400', async () => {
    const invalidUsername = '';
    const invalidEmail = '';
    const invalidPassword = '';

    await request(app)
      .post('/signup')
      .send({
        username: invalidUsername,
        email: invalidEmail,
        password: invalidPassword,
      })
      .set('Accept', 'application/json')
      .expect(400)
      .catch((err) => {
        expect(err.body.errors).toBeDefined();
        expect(err.body.errors.username).toBeDefined();
        expect(err.body.errors.email).toBeDefined();
        expect(err.body.errors.password).toBeDefined();
      });
  });
});

describe('/POST user signin', () => {
  const username = createRandomString(8);
  const email = createRandomString(8, '@email.com');
  const password = 'pass';

  beforeAll(async () => {
    // Create a new user
    await createUserRoute(username, email, password);
  }, 10000);

  test('Sign in with incorrect username throws 401 error', async () => {
    await signinRoute(`${username}1`, password, 401).catch((err) => {
      expect(err).toBeDefined();
    });
  }, 10000);

  test('Sign in with incorrect password throws 401 error', async () => {
    await signinRoute(username, `${password}1`, 401).catch((err) => {
      expect(err).toBeDefined();
    });
  }, 10000);

  test('Sign in with correct params responses with token in cookie', async () => {
    await signinRoute(username, password, 200).then((res) => {
      expect(res.body.success).toBeTruthy();
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0].includes('token')).toBeTruthy();
    });
  }, 10000);
});

describe('/GET user profile', () => {
  const username = createRandomString(8);
  const email = createRandomString(8, '@email.com');
  const password = 'pass';

  beforeAll(async () => {
    // Create a user to be serached for
    await createUserRoute(username, email, password);
  }, 20000);

  test('User not found response with 200 error message', async () => {
    await request(app)
      .get(`/user/${username}1/data`)
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        expect(res.body.error).toBeDefined();
      });
  });

  test('User found responses with user data', async () => {
    await request(app)
      .get(`/user/${username}/data`)
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        expect(res.body.username).toBeDefined();
        expect(res.body.email).toBeDefined();
        expect(res.body.displayName).toBeDefined();
        expect(res.body.profileImage).toBeDefined();
      });
  });
});

describe('/POST /account/recovery/password', () => {
  const username = createRandomString(8);
  const email = createRandomString(8, '@email.com');
  const password = 'pass';

  beforeAll(async () => {
    await createUserRoute(username, email, password);
  }, 10000);

  test('Non-existing username responses with success message', async () => {
    await request(app)
      .post('/account/recovery/password')
      .send({ field: `${username}1` })
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        expect(res.body.success).toBeTruthy();
      });
  });

  test('Non-existing email responses with success message', async () => {
    await request(app)
      .post('/account/recovery/password')
      .send({ field: `e${email}` })
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        expect(res.body.success).toBeTruthy();
      });
  });

  test('Username should response with success and call to emailer', async () => {
    await request(app)
      .post('/account/recovery/password')
      .send({ field: username })
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        expect(res.body.success).toBeTruthy();
        expect(sendEmailTemplate.mock.calls.length).toBe(1);
      });
  });

  test('Email should response with success and call to emailer', async () => {
    await request(app)
      .post('/account/recovery/password')
      .send({ field: email })
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        expect(res.body.success).toBeTruthy();
        expect(sendEmailTemplate.mock.calls.length).toBe(1);
      });
  });
});

describe('/POST updating user password', () => {
  const route = '/user/password/update';
  const username = createRandomString(8);
  const email = createRandomString(8, '@email.com');
  const password = 'pass';
  const newPassword = 'pass1';
  let userCookie; // User token to use as authorization

  beforeAll(async () => {
    await createUserRoute(username, email, password).then((res) => {
      userCookie = res.headers['set-cookie'][0];
    });
  }, 20000);

  function updatePasswordRoute(
    pass,
    newPass,
    newPassC,
    status = 200,
    cookie = userCookie
  ) {
    return request(app)
      .post(route)
      .set('Cookie', cookie)
      .send({ password: pass, newPassword: newPass, newPasswordC: newPassC })
      .expect(status);
  }

  test('Using incorrect current response with 400', async () => {
    await updatePasswordRoute(
      `${password}c`,
      newPassword,
      newPassword,
      200
    ).then((res) => {
      expect(res.body.password).toBeDefined();
    });
  }, 10000);

  test('Using incorrect confirm password responses with 400', async () => {
    await updatePasswordRoute(
      password,
      newPassword,
      `${newPassword}c`,
      400
    ).catch((err) => {
      expect(err.body.errors.newPasswordC).toBeDefined();
    });
  }, 10000);

  test('Sucessful responses updates ', async () => {
    await updatePasswordRoute(password, newPassword, newPassword, 200).then(
      (res) => {
        expect(res.body.success).toBeDefined();
      }
    );

    // Can login with new password
    await signinRoute(username, newPassword, 200).then((res) => {
      expect(res.body.success).toBeTruthy();
    });
  }, 20000);
});

describe('/GET current user data', () => {
  const username = createRandomString(8);
  const email = createRandomString(8, '@email.com');
  const password = 'pass';
  let userCookie;

  beforeAll(async () => {
    // Create user to test with and sign user in
    await createUserRoute(username, email, password);
    await signinRoute(username, password).then((res) => {
      userCookie = res.headers['set-cookie'][0];
    });
  }, 20000);

  /**
   * Creates and returns a request for getting current user data.
   * @param {number} status Status code to expect from request
   * @param {string} cookie Cookie to use for authroization
   * @return {Promise<Object>} A promise to resolve with a response object.
   */
  function userDataRoute(status = 200, cookie = userCookie) {
    return request(app).get('/user/data').set('Cookie', cookie).expect(status);
  }

  test('Invalid cookie will response with 401 error', async () => {
    await userDataRoute(401, 'token=2');
  });

  test('Valid token will response with user data', async () => {
    await userDataRoute(200, userCookie).then((res) => {
      expect(res.body.username).toBeDefined();
    });
  });
});

describe('/POST reset password', () => {
  const username = createRandomString(8);
  const email = createRandomString(8, '@email.com');
  const password = 'pass';
  const newPassword = 'pass1';
  let resetRoute;

  beforeAll(async () => {
    // Create a new user and send a password reset email
    await createUserRoute(username, email, password);
    await emailRecoveryRoute(username).then((res) => {
      resetRoute = sendEmailTemplate.mock.calls[0][3].link.split(
        `${IP}:${PORT}`
      )[1];
    });
  }, 20000);

  /**
   * Creates and returns a request to reset password.
   * @param {string} route Route to send request to
   * @param {string} pass New password to set for user
   * @param {string} passC Confirm of new password.
   * @param {number} status Expected status code from response.
   * @return {Promise<object>} A promise to resolve with a response object.
   */
  function resetPasswordRoute(route, pass, passC, status = 200) {
    return request(app)
      .post(route)
      .send({ password: pass, passwordC: passC })
      .set('Accpet', 'application/json')
      .expect(status);
  }

  test('Invalid password throws 400 error', async () => {
    const invalidPassword = 'p';
    resetPasswordRoute(resetRoute, invalidPassword, invalidPassword, 400).catch(
      (err) => {
        expect(err.body.errors.newPassword).toBeDefined();
      }
    );
  });

  test('Incorrect confirm password throw 400 error', async () => {
    resetPasswordRoute(resetRoute, newPassword, `${newPassword}1`, 400).catch(
      (err) => {
        expect(err.body.errors.newPasswordC).toBeDefined();
      }
    );
  });

  test('Using invalid tokens responses with a 400 error', async () => {
    await resetPasswordRoute(
      `${resetRoute}1`,
      newPassword,
      newPassword,
      400
    ).catch((err) => {
      expect(err).toBeDefined();
    });
  });

  test('Successful password resets responses with 200', async () => {
    await resetPasswordRoute(resetRoute, newPassword, newPassword).then(
      (res) => {
        expect(res.body.success).toBeTruthy();
      }
    );

    // Check if user can sign in with new password
    await signinRoute(username, newPassword).then((res) => {
      expect(res.body.success).toBeTruthy();
    });
  }, 20000);
});

describe('/POST updating user data', () => {
  const username = createRandomString(8);
  const email = createRandomString(8, '@email.com');
  const password = 'pass';
  let userCookie; // Cookie for user auth

  beforeAll(async () => {
    await createUserRoute(username, email, password).then((res) => {
      userCookie = res.headers['set-cookie'][0];
    });
  }, 10000);

  /**
   * Creates and returns request for updating user data.
   * @param {string} pass Password of current user
   * @param {object} params Data to send with request as a JSON.
   * @param {200} status Expected status code from response.
   * @return {Promise<object>} A promise to resolve with a response object.
   */
  function updateUserRoute(params = {}, status = 200, cookie = userCookie) {
    return request(app)
      .post('/user/settings/update')
      .set('accept', 'multipart/form-data')
      .field(params)
      .set('Cookie', cookie)
      .expect(status);
  }

  test('Updating with used username throws 400 error', async () => {
    await updateUserRoute({ username }, 400).catch((err) => {
      expect(err.response.body.errors.username);
    });
  }, 10000);

  test('Updating with used email throws 400 error', async () => {
    await updateUserRoute({ email }, 400).catch((err) => {
      expect(err.body.errors.email);
    });
  }, 10000);

  test('Updating username response with success', async () => {
    const newUsername = `${username}2`;
    await updateUserRoute({ username: newUsername }).then((res) => {
      expect(res.body.success).toBeTruthy();
    });

    // Try logging in with the new username
    await signinRoute(newUsername, password).then((res) => {
      expect(res.body.success).toBeTruthy();
    });
  }, 20000);

  test('Updating email responses with success', async () => {
    const newEmail = `e${email}`;
    await updateUserRoute({ email: newEmail }).then((res) => {
      expect(res.body.success).toBeTruthy();
    });
  }, 10000);
});
