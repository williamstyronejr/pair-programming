const bcrypt = require('bcrypt');
const User = require('../models/user');

/**
 * Generates a salt and creates a hash from the password provided using
 *  bcrypt's genSalt and hash functions.
 * @param {string} password The password to hash
 * @return {Promise<string>} A promise to resolve with the update
 */
function hashPassword(password) {
  return bcrypt
    .genSalt(16)
    .then((salt) => bcrypt.hash(password, salt).then((hash) => hash));
}

exports.hashPassword = hashPassword;

/**
 * Searchs DB for users based on given params.
 * @param {object} params The search parameters for users.
 * @return Returns a promise of mongoose query execution.
 */
exports.findUsers = (params) => User.find(params).exec();

/**
 * Finds and returns a user by it's username.
 * @param {string} username The username of the user to search for
 * @param {object} projection Object containg fields to include/exclude
 * @return {Promise} A promise to resolve with a user object of null if no
 *  user is found.
 */
exports.findUserByUsername = (username, projection = null) =>
  User.findOne({ username }, projection).exec();

/**
 * Finds and returns a user by it's email.
 * @param {string} email Email of user to serach for
 * @return {Promise} A promise to resolve with a user object of null if no
 *  user is found.
 */
exports.findUserByEmail = (email, projection) =>
  User.findOne({ email }, projection).exec();

/**
 * Hashes provided password and then updates user wiht the new hash.
 * @param {string} id Id of user to update
 * @param {string} password Non-hashed password
 * @return {Promise<object>} A promise to resolve with the user object
 *  (not updated).
 */
exports.updateUserPassword = (id, password) => {
  return hashPassword(password).then((hash) =>
    User.findByIdAndUpdate(id, { password: hash }).exec()
  );
};

/**
 * Hashes the provided password and uses all parameters to create a new user.
 * @param {string} username A username
 * @param {string} email An email
 * @param {string} password A unhashed password
 * @param {string} profileImage Filename for a profile image.
 * @return {Promise<object>} A promise resolve with the new user object.
 */
exports.createUser = (
  username,
  email,
  password,
  profileImage = 'default.jpg'
) => {
  return hashPassword(password).then((hash) => {
    return User({
      username,
      displayName: username,
      email,
      password: hash,
      profileImage,
    }).save();
  });
};

/**
 * Searchs for any users that have the provided username and/or email.
 * @param {string} username Username to search for
 * @param {string} email email to search for
 * @return {Promise<array>} A promise to resolve with an array of users that
 *  have the provided username and/or email. If no user is found resolves with
 *  an empty array.
 */
exports.usernameEmailAvailability = (username, email) => {
  return User.findOne({
    $or: [
      {
        username,
        email,
      },
    ],
  }).exec();
};

/**
 * Updates users data with provided params. Use only if no direct function
 *  exists.
 * @param {string} id Id of user to update
 * @param {object} params Object containing fields + values
 * @return {Promise<object>} A promise to resolve with the user object
 *  (not updated).
 */
exports.updateUser = (id, params) => {
  return User.findByIdAndUpdate(id, params).exec();
};
