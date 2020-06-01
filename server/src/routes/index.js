const userRouter = require('./user');
const challengeRouter = require('./challenge');

module.exports = function setUpRoutes(app) {
  app.use(userRouter);
  app.use(challengeRouter);
};
