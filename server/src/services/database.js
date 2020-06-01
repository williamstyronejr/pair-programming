const mongoose = require('mongoose');

/**
 * Sets-up connection to database.
 * @param {string} uri The connection URI for mongoose
 * @param {object} options Mongoose options
 * @return {Promise} A promise to resolve after database connection is made.
 *  Or reject if database is not reached.
 */
module.exports.connectDatabase = (
  uri,
  options = { useNewUrlParser: true, useUnifiedTopology: true }
) => {
  // Setup DB
  return mongoose.connect(uri, options);
};

/**
 * Closes all connections to Database.
 * @return {Promise} A promise to resolve once mongoose connections are closed
 */
module.exports.disconnectDatabase = () => {
  return mongoose.disconnect();
};
