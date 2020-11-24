require('dotenv').config();
const http = require('http');
const { setUpChallengeQueue } = require('./services/scheduler');
const { connectDatabase } = require('./services/database');
const app = require('./services/app');
const { setupRedis } = require('./services/redis');
const { setupSocket } = require('./services/socket');
const { connectAMQP, setupConsumer } = require('./services/amqp');
const { receiveSolution } = require('./controllers/challenge');
const logger = require('./utils/winston');

const {
  SERVER_IP: IP,
  SERVER_PORT: PORT,
  DB_URI,
  REDIS_HOST,
  REDIS_PORT,
  RABBITMQ_URL,
  CONSUMER_QUEUE,
} = process.env;

setupRedis(REDIS_HOST, REDIS_PORT)
  .then(() => {
    connectDatabase(DB_URI).then(() => {
      connectAMQP(RABBITMQ_URL).then(() => {
        setUpChallengeQueue();
        const server = http.createServer(app);
        setupSocket(server);

        server.listen(PORT, IP, () => {
          // Setup listener for receiving code testing results through rabbitmq
          setupConsumer(CONSUMER_QUEUE, receiveSolution);

          console.log(`Server is running on: ${IP}:${PORT}`);
        });
      });
    });
  })
  .catch((err) => {
    // Log server ending errors and gracefully exit application
    logger.error(err);
    process.exit(1);
  });
