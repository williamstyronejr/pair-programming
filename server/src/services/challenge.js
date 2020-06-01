const Challenge = require('../models/challenge');

/**
 * Creates and return a challenge.
 * @param {string} title The title of the challenge
 * @param {string} prompt The prompt, or description, of the challenge
 * @param {string} solution The solution to test against.
 * @return {Promise<object>} A promise to resolve with a challenge object.
 */
exports.createChallenge = (title, prompt, solution) => {
  return Challenge({ title, prompt, solution }).save();
};

/**
 * Finds and returns a list of challenges. Sorts the list of challenges so
 *  results are consistent to prevent duplicates.
 * @param {number} skip The amount of challenge to skip
 * @param {number} limit The number of challenge to return
 * @param {object} projection Object containing fields to include/exclude
 * @return {Promise<array>} A promise to resolve with an array of
 *  challenge objects, null if none are found.
 */
exports.getChallengeList = (skip = 0, limit = 10, projection = null) => {
  return Challenge.find({}, projection)
    .sort({ _id: +1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

/**
 * Finds and returns a challenge by its id.
 * @param {string} id The id of the challenge to find
 * @param {object} projection Object containing fields to include/exclude
 * @return {Promise<object>} A promise to resolve with a challenge object if
 *  if found, null otherwise.
 */
exports.findChallenge = (id, projection = null) => {
  return Challenge.findById(id, projection).exec();
};

/**
 * Updates a challenge that matchs the id and solution provided by incrementing it's
 *  completed count. Will only update if correct solution is provided.
 * @param {String} id The id of the challenge to test solution against
 * @param {String} testSolution Solution to test against
 * @param {Number} inc Amount to increment completed count by.
 * @return {Promise<object>} A promise to resolve with the challenge object if
 *  the solution was correct, null otherwise.
 */
exports.compareSolution = (id, testSolution, inc = 1) => {
  return Challenge.findOneAndUpdate(
    { _id: id, solution: testSolution },
    { $inc: { 'meta.completed': inc } }
  ).exec();
};
