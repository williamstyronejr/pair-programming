const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  challenge: { type: String },
  language: { type: String },
  code: { type: String },
  private: { type: Boolean, default: false },
  users: { type: Array },
  size: { type: Number, default: 2 },
  usersInRoom: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  inviteKey: { type: String },
});

const Room = mongoose.model('room', roomSchema);
module.exports = Room;
