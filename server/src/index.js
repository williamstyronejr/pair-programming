require('dotenv').config();
const http = require('http');
const { setUpChallengeQueue } = require('./services/scheduler');
const { connectDatabase } = require('./services/database');
const app = require('./services/app');
const { setupRedis } = require('./services/redis');
const { setupSocket } = require('./services/socket');
const logger = require('./utils/winston');

const {
  SERVER_IP: IP,
  SERVER_PORT: PORT,
  DB_URI,
  REDIS_HOST,
  REDIS_PORT,
} = process.env;

setupRedis(REDIS_HOST, REDIS_PORT)
  .then(() => {
    connectDatabase(DB_URI).then(() => {
      setUpChallengeQueue();
      const server = http.createServer(app);
      setupSocket(server);

      server.listen(PORT, IP, () => {
        console.log(`Server is running on: ${IP}:${PORT}`);
      });
    });
  })
  .catch((err) => {
    // Log server ending errors and gracefully exit application
    logger.error(err);
    process.exit(1);
  });
