const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
  usernameEmailAvailability,
  hashPassword,
  createUser,
  findUserByEmail,
  findUserByUsername,
  updateUser,
} = require('../services/user');

const { JWT_SECRET } = process.env;

/**
 * Creates a Jwt for a given user object using jsonwebtoken
 * @param {object} user User object from database
 * @return {string} A Jwt for given user
 */
function createJwt(user) {
  const timestamp = new Date().getTime();
  return jwt.sign({ sub: user.id, iat: timestamp }, JWT_SECRET, {});
}

/**
 * Route handler for local signup. On successful user creation, a JWT will be set in cookie
 *  and resposne with a success message.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.localSignup = async (req, res, next) => {
  const { email, username, password } = req.body;

  try {
    const user = await createUser(username, email, password);

    res.cookie('token', createJwt(user));
    res.json({ success: true, user });
  } catch (err) {
    return next(err);
  }
};

/**
 * Router handler for signing in using local signin. Response with a JWT.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.localSignin = (req, res, next) => {
  res.cookie('token', createJwt(req.user));
  res.json({ success: true, user: req.user });
};

/**
 * Router handler for signing a user out by destroying the user's cookie
 *  and redirecting themt to the landing page.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.signout = (req, res, next) => {
  res.cookie('token', '', { expires: new Date(0) });
  res.redirect('/');
};

/**
 * Router handler for verifing inputs such as username and email. Response with
 *  errors in json format.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.verifyInputs = async (req, res, next) => {
  return res.json({ success: true });
};

/**
 * Middleware for handling github auth callback.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Next middleware
 */
exports.verifyGitSignin = (req, res, next) => {
  passport.authenticate(
    'github',
    { session: false, scope: ['user:email'], failureRedirect: '/login' },
    (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.json({ error: 'Invalid' });

      const token = createJwt(user);

      // Store token into cookie and redirect user to github verify account
      res.cookie('token', token, {});
      return res.redirect('/challenges');
    }
  )(req, res, next);
};

/**
 * Route handler for registering github user accounts by setting the user's
 *  username.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Next middleware
 */
exports.registerGithubUser = (req, res, next) => {
  // If account is not from github, throw error
  if (!req.user || !req.user.githubId) {
    const err = new Error('Error occured');
    err.status = 401;
    return next(err);
  }

  const { username } = req.body;

  // Update user with new username and mark as verified
  updateUser(req.user.id, { username, verified: true })
    .then((user) => {
      res.send({ success: true });
    })
    .catch((err) => {
      next(err);
    });
};

exports.requireLocalSignin = passport.authenticate('local', { session: false });

/**
 * Middleware for starting GitHub auth request
 */
exports.requireGitSignin = passport.authenticate('github', {
  session: false,
  scope: ['user:email'],
});

/**
 * Middleware to require user to have a valid Jwt to access route
 */
exports.requireAuth = passport.authenticate('jwt', { session: false });
