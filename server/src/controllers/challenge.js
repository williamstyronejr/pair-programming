const { emitMessageToRoom } = require('../services/socket');
const {
  createRoom,
  findRoom,
  setRoomToJoinable,
  addUserToRoom,
  markRoomCompleted,
} = require('../services/room');
const {
  createChallenge,
  getChallengeList,
  findChallenge,
  compareSolution,
} = require('../services/challenge');
const { publishToQueue } = require('../services/amqp');

const { PRODUCER_QUEUE } = process.env;

/**
 * Creates a invite key for a room. Current just using the room's id.
 * @param {stirng} rId Id for room to create invite link for
 */
function createInviteKey(rId) {
  return rId;
}

/**
 * Route handler for creating challenges. Only used for
 *  development purposes.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.createChallenge = (req, res, next) => {
  const { title, prompt, tags, initialCode } = req.body;

  createChallenge(title, prompt, tags, initialCode, false)
    .then((challenge) => {
      res.json({ challenge });
    })
    .catch((err) => {
      next(err);
    });
};

/**
 * Route handler for getting list of challenges based on a page number.
 *  Defaults to page one and list is limited to 1 challenge per request.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.getChallengeList = (req, res, next) => {
  // Check if page param is a number
  if (Number.isNaN(req.query.page - 0)) {
    return res.json({ error: 'Page number could not be recognized.' });
  }

  const limit = 10; // Max number of items to response with
  const page = parseInt(req.query.page, 10) || 0;

  if (page < 0) {
    const err = new Error('A negative number was used for pages');
    err.status = 400;
    return next(err);
  }

  getChallengeList(page * limit, limit)
    .then((list) => {
      res.json({ challenges: list });
    })
    .catch((err) => {
      next(err);
    });
};

/**
 * Route handler for creating a private room for a given challenge id.
 *  Responses with JSON with id of the room.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.createPrivateRoom = (req, res, next) => {
  const cId = req.params.id;
  const { _id: uId } = req.user;
  const { language } = req.body;

  createRoom(cId, [uId], language, true)
    .then((room) => {
      res.json({ room: room.id });
    })
    .catch((err) => {
      next(err);
    });
};

/**
 * Route handler for getting data on a given room. Resposne with JSON with room
 *  and challenge data. Currently responsing with entire object from DB.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.getRoomInfo = async (req, res, next) => {
  const { cId, rId } = req.params;
  const { _id: uId } = req.user;

  try {
    const [challenge, room] = await Promise.all([
      findChallenge(cId),
      findRoom(rId),
    ]);

    /*
     * Check if the room/challenge don't exists or
     *  the room is inaccessible to current user
     */
    if (
      !challenge ||
      !room ||
      room.users.indexOf(uId) == -1 ||
      room.completed
    ) {
      return res.json({ error: 'Room does not exists.' });
    }

    res.json({ challenge, room });
  } catch (err) {
    next(err);
  }
};

/**
 * Route handler for changing room to a public room that someone can be invited
 * to. Responses with an url for users to invite.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.convertRoomToPublic = (req, res, next) => {
  const { rId } = req.params;
  const { _id: uId } = req.user;

  const inviteKey = createInviteKey(rId);

  setRoomToJoinable(rId, uId, inviteKey)
    .then((room) => {
      if (!room) {
        const e = new Error(
          `User trying to make room public, but not apart of the room.`
        );
        e.status = 401;
        e.msg = { error: 'Current user can not make this request.' };
        throw e;
      }

      res.json({ invite: inviteKey });
    })
    .catch((err) => {
      next(err);
    });
};

/**
 * Route handler for adding user to room and responing with a link to room.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.joinRoomByInvite = async (req, res, next) => {
  const { _id: uId } = req.user;
  const { key } = req.params;

  try {
    const room = await findRoom(key);

    if (!room) {
      const error = new Error('Tried joining a non-existing room');
      error.status = 500;
      throw error;
    }

    const userInRoom = room.users.indexOf(String(uId)) !== -1;

    if (room.private || (room.users.length === room.size && !userInRoom)) {
      // Room is not accessible to current user.
      const err = new Error('Attemptted to join a full room');
      err.status = 500;
      err.msg = { error: 'Room is not accessible.' };
      return next(err);
    } else if (!userInRoom) {
      // Add user to the room
      await addUserToRoom(room.id, uId);
    }

    return res.json({ link: `/c/${room.challenge}/r/${room.id}` });
  } catch (err) {
    next(err);
  }
};

/**
 *
 * @param {Object} channel
 * @param {String} msg
 */
exports.receiveSolution = async (channel, msg) => {
  // const content = JSON.parse(msg.content.toString());
  const { tests, success, error } = JSON.parse(msg.content.toString());
  const { correlationId } = msg.properties;

  console.log(tests, success, error, correlationId);
  try {
    if (error) {
      // Emit to room the error that occurred.
      channel.ack(msg);
      return emitMessageToRoom('test_finish', correlationId, [
        null,
        null,
        error,
      ]);
    }

    // If all test passed, mark room as completed server side
    if (success) markRoomCompleted(correlationId);

    emitMessageToRoom('testCompleted', correlationId, [tests, success, null]);
    channel.ack(msg);
  } catch (err) {
    channel.ack(msg);
  }
};

/**
 * Route handler for run tests on user's code. Response with JSON with error or
 *  completed flag.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.testSolution = async (req, res, next) => {
  const { code, language } = req.body;
  const { cId, rId } = req.params;

  try {
    const challenge = await findChallenge(cId);

    if (!challenge) {
      const err = new Error(`Non existing challenge, ${cId}, being tested`);
      err.msg = 'Challenge being tested does not exist.';
      err.status = 422;
      throw err;
    }
  } catch (err) {
    if (err.status) return next(err);

    const error = new Error(`Invalid challenge, ${cId}, being tested`);
    error.status = 422;
    error.msg = 'Invalid challenge provided.';
    return next(error);
  }

  try {
    // Send code to launcher through RabbitMQ
    const sent = publishToQueue(
      PRODUCER_QUEUE,
      JSON.stringify({ code, language, challengeId: cId }),
      { correlationId: rId }
    );

    if (!sent) {
      const err = new Error('Error occurred trying to request test run');
      err.status = 500;
      err.msg =
        'Unexpected error occurred when running test, please try again.';
      throw err;
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
