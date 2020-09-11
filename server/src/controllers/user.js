const {
  findUserByUsername,
  findUserByEmail,
  updateUserPassword,
  updateUser,
} = require('../services/user');
const {
  generateToken,
  findTokenById,
  deleteToken,
} = require('../services/resetToken');
const { sendEmailTemplate } = require('../services/emailer');

const { SERVER_IP: IP, SERVER_PORT: PORT } = process.env;

/**
 * Route handler for getting logged in user's data. Current response with
 *  all user data.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.getCurrentUserData = (req, res, next) => res.json(req.user);

/**
 * Route handler for getting a specific user's data by username. If no user is
 *  not found, response with JSON error message. Currently response with the
 *  user's username, email, and profileImage.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.getUserData = (req, res, next) => {
  const { user: username } = req.params;

  findUserByUsername(username, {
    password: false,
    __v: false,
  })
    .then((user) => {
      if (user) return res.json(user);

      res.json({ error: 'user not found' });
    })
    .catch((err) => {
      next(err);
    });
};

/**
 * Route handler for updating the current user's settings. Settings include
 *  username, email, and profile image.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.updateUserData = (req, res, next) => {
  const { username, email, password } = req.body;
  const { file } = req;

  let params = {};

  if (username) params = { ...params, username };
  if (email) params = { ...params, email };
  if (file) params = { ...params, profileImage: file.filename };

  // Update user's settings
  updateUser(req.user._id, params)
    .then((results) => {
      res.json({ success: true });
    })
    .catch((err) => {
      next(err);
    });
};

/**
 * Route handler for updating current user's password.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.updateUserPassword = async (req, res, next) => {
  const { password, newPassword } = req.body;

  // Check password against current user's password
  try {
    const valid = await req.user.comparePassword(password);

    if (!valid) {
      const error = new Error(
        'Incorrect current password when updating password.'
      );
      error.msg = { password: 'Incorrect password' };
      error.status = 400;
      throw error;
    }

    await updateUserPassword(req.user._id, newPassword);

    res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};

/**
 * Route handler for sending password recovery email to account by
 * username or email. Responses with success even if no user is found,
 *  but will not send a email.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.sendPasswordEmail = async (req, res, next) => {
  const { field } = req.body;

  try {
    const user = await (field.indexOf('@') === -1
      ? findUserByUsername(field)
      : findUserByEmail(field));

    if (!user) return res.json({ success: true });

    const { id: tokenId, token } = await generateToken(user.id);

    // Send URL to user's email
    sendEmailTemplate(
      user.email,
      'Password Recovery',
      'password_recovery.html',
      {
        link: `${IP}:${PORT}/account/reset/password?id=${tokenId}&token=${token}`,
      },
      (mailErr) => {
        if (mailErr) throw new Error('Could not send email');
        return res.json({ success: true });
      }
    );
  } catch (err) {
    return next(err);
  }
};

/**
 * Route handler for reseting user's password. Responses with an error message
 * if token is invalid (expired or doesn't exist). Will delete token if used.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.passwordReset = async (req, res, next) => {
  const { id, token } = req.query;
  const { password } = req.body;

  const resetToken = await findTokenById(id);
  if (!resetToken) {
    const err = new Error('Invalid token');
    err.status = 400;
    return next(err);
  }

  const validToken = await resetToken.compareToken(token);

  if (!validToken) {
    const err = new Error('Invalid token');
    err.status = 400;
    return next(err);
  }

  // Delete the token and update user's password
  try {
    await Promise.all([
      deleteToken(id),
      updateUserPassword(resetToken.userId, password),
    ]);

    res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};
