/**
 * Generates a random string using Math random.
 * @param {Number} length Length of the string to be created
 * @param {String} append String to be append to random string (Ignores length)
 * @return {String} Returns a random string.
 */
exports.createRandomString = (length, append = '') => {
  let s = '';
  do {
    s += Math.random().toString(36).substr(2);
  } while (s.length < length);
  s = s.substr(0, length);

  return s.concat(append);
};
