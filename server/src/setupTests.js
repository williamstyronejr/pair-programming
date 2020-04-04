require('dotenv').config(); // Read .env before all test

/**
 * Generates a random string using Math.random.
 * @param {Number} len
 * @param {String} append String to append to the random string
 */
global.generateString = function (length = 16, append = '') {
  return (
    (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    ).substring(0, length) + append
  );
};
