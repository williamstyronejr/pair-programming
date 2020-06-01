const crypto = require('crypto');
const bcrypt = require('bcrypt');
const ResetToken = require('../models/resetToken');

/**
 * Generates a reset token for a user with using crypto to generate a random
 *  string and then bcrypt to hash it. Hashing used to protect against access
 *  DB.
 * @param {string} userId Id of user to create token for
 * @return {Promise<object>} A promise to resolve with the id of the token and
 *  the random string.
 */
exports.generateToken = (userId) => {
  const token = crypto.pseudoRandomBytes(16).toString('hex');

  return bcrypt.genSalt(10).then((salt) =>
    bcrypt.hash(token, salt).then((hash) =>
      ResetToken({ userId, token: hash })
        .save()
        .then((resetToken) => ({ id: resetToken.id, token }))
    )
  );
};

/**
 * Finds and returns a reset token by it's id.
 * @param {string} id Id of token to find.
 * @return {Promise<object>} A promise to resolve with a token object if one
 *  is found, or null if none.
 */
exports.findTokenById = (id) => ResetToken.findById(id).exec();

/**
 * Finds and removes a tokens from the collection using an id.
 * @param {string} id Id of token to delete
 * @return {Promise} A Promise to resolve after deleting.
 */
exports.deleteToken = (id) => ResetToken.findByIdAndRemove(id);
