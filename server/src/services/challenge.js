const Challenge = require('../models/challenge');

/**
 * Creates and return a challenge.
 * @param {String} title The title of the challenge
 * @param {String} prompt The prompt, or description, of the challenge
 * @param {String} tags Tags separated by commas, will be set to lower case
 * @param {Array<Object>} initialCode List of supported languages and initial
 *  code templates for those languages
 * @return {Promise<Object>} A promise to resolve with a challenge object.
 */
exports.createChallenge = (
  title,
  prompt,
  tags,
  initialCode,
  isPublic = false
) => {
  return Challenge({
    title,
    prompt,
    tags: tags.toLowerCase(),
    initialCode,
    isPublic,
  }).save();
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
