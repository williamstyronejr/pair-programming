const path = require('path');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const winston = require('../utils/winston');
const RootRouter = require('../routes/index');
require('./passport'); // Sets up strategies for passport

const app = express();

// Setup middleware
//app.use(morgan('combined', { stream: winston.stream }));
app.use(cookieParser());

// Setup routes
app.use(passport.initialize());
RootRouter(app);
app.use('/img', express.static(path.join(__dirname, '..', 'public', 'images')));
app.use((err, req, res, next) => {
  // console.log(err);
  // Simple error log
  //winston.error(
  //`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
  //req.method
  //} - ${req.ip}`
  //);

  if (err) {
    if (err.status === 422) {
      //  Invalid input values
      return res.status(err.status).json({ errors: err.msg });
    }

    if (err.status === 403) {
      // Need to redirect
      if (err.to) {
        return res.redirect(err.to);
      }

      return res.status(err.status).send(err.msg);
    }

    // Invalid input types
    if (err.status === 400) {
      return res.status(err.status).json({ errors: err.msg });
    }
  }

  return res
    .status(err.status || 500)
    .send(err.msg || 'An error has occurred on the server. Please try again.');
});

module.exports = app;
