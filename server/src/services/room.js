const Room = require('../models/room');

/**
 * Creates a room for challenge and adds users into it.
 * @param {String} challengeId Id for challenge room is set to
 * @param {Array} users Array of user id that can join the room
 * @param {String} language Programming language being used
 * @param {Boolean} isPrivate Flag to indicate if room is private
 * @param {Number} size Max number of user in the room
 * @return Returns a promise that resolves with the room object.
 */
exports.createRoom = (
  challengeId,
  users,
  language,
  isPrivate = false,
  size = 2
) => {
  return Room({
    challenge: challengeId,
    language,
    users,
    private: isPrivate,
    size,
    userInRoom: users.length,
  }).save();
};

/**
 * Finds and returns a room.
 * @param {string} id The id of the room to find
 * @return {Promise<object>} A promise to resolve with a room object, or null
 *  if no room is found.
 */
exports.findRoom = (id) => {
  return Room.findById(id).exec();
};

/**
 * Finds and updates the room private flag only if the user making the request
 *  is already in the room.
 * @param {String} id The id of the room to make joinable
 * @param {String} userId The id of the user trying to make the room public
 * @param {String} inviteKey The invite key to allow other players to join room
 * @return {Promise<objet>} A promise to resolve with the room object
 *  before it's updated.
 */
exports.setRoomToJoinable = (roomId, userId, inviteKey) => {
  return Room.findOneAndUpdate(
    { _id: roomId, users: userId },
    { private: false, inviteKey }
  ).exec();
};

/**
 * Adds a user to the room and increase room count if there's is room and
 *  user is not already in the room.
 * @param {string} roomId The id of the room to add the user to
 * @param {string} userId The id of the user to add to the room
 * @return {Promise<object>} A promise to resolve with the room object
 *  before updating, or null if room is full or not found.
 */
exports.addUserToRoom = (roomId, userId) => {
  return Room.findOneAndUpdate(
    {
      _id: roomId,
      $expr: { $lt: ['$usersInRoom', '$size'] },
      users: { $ne: userId },
    },
    { $addToSet: { users: userId }, $inc: { usersInRoom: 1 } }
  ).exec();
};

/**
 * Finds and updates a room to be marked completed.
 * @param {string} id The id of the room to mark completed.
 * @return {Promise<object>} A promise to resolve with a room object, or null
 *  if no room is found.
 */
exports.markRoomCompleted = (id) => {
  return Room.findByIdAndUpdate(id, {
    completed: true,
  }).exec();
};
