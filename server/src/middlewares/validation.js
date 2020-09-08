const { body, validationResult } = require('express-validator');
const User = require('../models/user');

/**
 * Creates format for validation messages. each message will be in the form of
 *  { [param]: msg }.
 * @param {string} msg Message passed by valdation rules
 * @return {string} Returns just hte message that was passed.
 */
const validationFormat = ({ msg }) => msg;

/**
 * Checks validation rule results. If any errors, response with errors in
 *  json, otherwise call next function.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
function checkValdation(req, res, next) {
  const errors = validationResult(req).formatWith(validationFormat);

  if (!errors.isEmpty()) {
    const err = new Error('Valdator caught invalid user inputs');
    err.status = 400;
    err.msg = errors.mapped();
    return next(err);
  }

  // No errors found, call to next
  return next();
}

const userEmailValidation = [
  body('username', 'Invalid username')
    .optional()
    .trim()
    .matches(/^[A-Za-z0-9_]+$/) // letters a - z, numbers, and _
    .withMessage('Please only use letters (a-z), numbers, and underscores(_).')
    .isLength({ min: 4, max: 16 })
    .withMessage('Username must be between 4 and 16 characters.')
    .custom((value) =>
      User.findOne({ username: value }).then((user) => {
        if (user) throw new Error('Username is already taken.');
      })
    ),
  body('email', 'Invalid email.')
    .optional()
    .isEmail()
    .withMessage('Invalid email')
    .normalizeEmail()
    .custom((value) =>
      User.findOne({ email: value }).then((user) => {
        if (user) throw new Error('Email is already in use');
      })
    ),
];

exports.validateInputs = [...userEmailValidation, checkValdation];

/**
 * Validation rules for local user signup
 */
exports.validateSignup = [
  body('username', 'Invalid username')
    .exists()
    .withMessage('Must provide username')
    .trim()
    .matches(/^[A-Za-z0-9_]+$/) // letters a - z, numbers, and _
    .withMessage('Please only use letters (a-z), numbers, and underscores(_).')
    .isLength({ min: 4, max: 16 })
    .withMessage('Username must be between 4 and 16 characters.')
    .custom((value) =>
      User.findOne({ username: value }).then((user) => {
        if (user) throw new Error('Username is already taken.');
      })
    ),
  body('password', 'Invalid password')
    .exists()
    .withMessage('Must provide password.')
    .isLength({ min: 4, max: 36 })
    .withMessage('Password must be between 4 and 36 characters.'),
  body('email', 'Invalid email.')
    .exists()
    .withMessage('Must provide email.')
    .isEmail()
    .withMessage('Invalid email')
    .normalizeEmail()
    .custom((value) =>
      User.findOne({ email: value }).then((user) => {
        if (user) throw new Error('Email is already in use');
      })
    ),
  checkValdation,
];

/**
 *
 * @param {*} msg Error
 */
exports.validationFormat = ({ msg }) => msg;

/**
 * Validation rules for updating settings. Only requires that
 *  a password is supplied, everything else is optional.
 */
exports.validateSettingsUpdate = [
  body('username', 'eror')
    .optional()
    .trim()
    .matches(/^[A-Za-z0-9_]+$/) // letters a - z, numbers, and _
    .withMessage('Please only use letters (a-z), numbers, and underscores(_).')
    .isLength({ min: 4, max: 16 })
    .withMessage('Username must be between 4 and 16 characters.')
    .custom((value) =>
      User.findOne({ username: value }).then((user) => {
        if (user) throw new Error('Username is already taken.');
      })
    ),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email.')
    .normalizeEmail()
    .custom((value) =>
      User.findOne({ email: value }).then((user) => {
        if (user) throw new Error('Email is already in use');
      })
    ),
  checkValdation,
];

/**
 * Validation rules for updating current user's password
 */
exports.validatePasswordUpdate = [
  body('password')
    .exists()
    .withMessage('Must provide old password.')
    .isLength({ min: 4, max: 36 })
    .withMessage('Invalid password.'),
  body('newPassword')
    .exists()
    .withMessage('Must provide new password.')
    .isLength({ min: 4, max: 36 })
    .withMessage('Invalid password.'),
  body('newPasswordC')
    .exists()
    .withMessage('Must confirm new password.')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Password does not match.'),
  checkValdation,
];

exports.validatePasswordReset = [
  body('password')
    .exists()
    .withMessage('Please provide new password.')
    .isLength({ min: 4, max: 36 })
    .withMessage('Password must be between 4 and 36 characters.'),
  body('passwordC')
    .exists()
    .withMessage('Must confirm new password.')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do no match.'),
  checkValdation,
];
