const path = require('path');
const winston = require('winston');

// define the custom settings for each transport (file, console)
const options = {
  file: {
    level: 'info',
    filename: path.join(__dirname, '../', 'logs/', 'app.log'),
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true
  }
};

const transports = [new winston.transports.File(options.file)];

// Remove console logging during ci testing
if (process.env.NODE_ENV !== 'ci') {
  transports.push(new winston.transports.Console(options.console));
}

// instantiate a new Winston Logger with the settings defined above
const logger = winston.createLogger({
  transports,
  exitOnError: false // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: (message, encoding) => {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  }
};

module.exports = logger;
