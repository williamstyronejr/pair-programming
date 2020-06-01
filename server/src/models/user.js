const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  displayName: { type: String },
  password: { type: String },
  profileImage: { type: String },
  githubId: { type: String }, // Used only if account is
  verified: { type: Boolean, default: false },
  created: { type: Date, default: Date.now },
  completed: { type: Object },
});

/**
 * Comapares plain password to hashed verison to verify using bcrypt's
 *  compare function.
 * @param {string} password The password to compare the hash to
 * @return {Promise<boolean>} A promise to resolve with a boolean indicating
 *  whether or not the password is valid.
 */
userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('user', userSchema);
module.exports = User;
