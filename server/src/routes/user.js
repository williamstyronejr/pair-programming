const router = require('express').Router();
const bodyParser = require('body-parser');
const auth = require('../controllers/authentication');
const validationController = require('../middlewares/validation');
const userController = require('../controllers/user');
const { profileUpload } = require('./utils');

const jsonParser = bodyParser.json();

// Auth routes for signin/signup
router.post(
  '/signup',
  jsonParser,
  validationController.validateSignup,
  auth.localSignup
);

router.post('/signin', jsonParser, auth.requireLocalSignin, auth.localSignin);

router.post('/signout', auth.signout);

// Route for registering a github user
router.post(
  '/account/register',
  jsonParser,
  auth.requireAuth,
  validationController.validateInputs,
  auth.registerGithubUser
);

// Route for checking if username or email is in use
router.post(
  '/inputvalidator',
  jsonParser,
  validationController.validateInputs,
  auth.verifyInputs
);

// Routes for github auth
router.get('/auth/github', auth.requireGitSignin, (req, res) => {});
router.get('/auth/github/callback', auth.verifyGitSignin);

// Route for getting logged in user data
router.get('/user/:user/data', userController.getUserData);
router.get('/user/data', auth.requireAuth, userController.getCurrentUserData);

// Routes for updating/reseting user data
router.post(
  '/settings/account',
  profileUpload,
  validationController.validateSettingsUpdate,
  auth.requireAuth,
  userController.updateUserData
);

router.post(
  '/settings/password',
  jsonParser,
  validationController.validatePasswordUpdate,
  auth.requireAuth,
  userController.updateUserPassword
);

router.post(
  '/account/recovery/password',
  jsonParser,
  userController.sendPasswordEmail
);

router.post(
  '/account/reset/password',
  jsonParser,
  validationController.validatePasswordReset,
  userController.passwordReset
);

module.exports = router;
