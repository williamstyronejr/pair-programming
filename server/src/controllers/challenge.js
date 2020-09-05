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
const { runCodeContainer } = require('../services/launcher');

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
  const { title, prompt, solution, tags } = req.body;

  createChallenge(title, prompt, solution, tags)
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
      res.json(list);
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

  createRoom(cId, [uId], true)
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
 * Route handler for run tests on user's code. Response with JSON with error or
 *  completed flag.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.testSolution = async (req, res, next) => {
  const { code } = req.body;
  const { cId, rId } = req.params;

  let userSolution;
  try {
    userSolution = JSON.parse(await runCodeContainer(rId, code, 'node'));
  } catch (error) {
    emitMessageToRoom(rId, 'testCompleted', 'Error running code');
    return res.json({ errors: error.message });
  }

  // If solution cames back undefined without an error
  if (!userSolution || userSolution.error) {
    emitMessageToRoom(rId, 'testCompleted', 'Unexpected error.');
    return res.json({ errors: 'Unexpected error.' });
  }

  // Compares user submitted solution to server's
  const challenge = await compareSolution(cId, userSolution.result);

  if (!challenge) {
    // Emit error message that solution doesn't work
    emitMessageToRoom(rId, 'testCompleted', 'Solution does not match ');
    return res.json({ errors: 'Solution does not match' });
  }

  await markRoomCompleted(rId);

  // Emit message to room
  emitMessageToRoom(rId, 'testCompleted');
  res.json({ solved: true });
};
