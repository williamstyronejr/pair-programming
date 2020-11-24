require('dotenv').config();
const {
  connectAMQP,
  setupConsumer,
  publishToQueue,
} = require('./services/amqp');
const { launchContainer } = require('./services/launcher');

const { RABBITMQ_URL, CONSUMER_QUEUE, PRODUCER_QUEUE } = process.env;

/**
 * Validates parameters for code launcher to prevent loading docker containers
 *  for invalid inputs.
 * @param {String} code Code to be tested
 * @param {String} language Language of code
 * @param {String} challengeId Id of challenge to run test against
 * @return {Boolean} Returns true if no errors are thrown.
 */
function validateMessage(code, language, challengeId) {
  if (!language) {
    const err = new Error();
    err.msg = 'Please provide the language the code is written in.';
    err.status = 422;
    throw err;
  }

  if (!code || typeof code !== 'string') {
    const err = new Error();
    err.msg = 'Please provide the code to run test on.';
    err.status = 422;
    throw err;
  } else if (!code.includes('function main')) {
    const err = new Error();
    err.msg = 'Code needs to contains the function "main" to be tested.';
    err.status = 422;
    throw err;
  }

  if (!challengeId) {
    const err = new Error();
    err.msg = 'Please provide the challenge the code belongs to.';
    err.status = 422;
    throw err;
  }

  return true;
}

/**
 * Handler for messages from queue by running the test on the provided code and
 *  publishing the results or errors to the separate queue.
 * @param {Object} channel AMQP channel to publish message to.
 * @param {Object} msg Incoming message of code to run tests on
 */
async function messageHandler(channel, msg) {
  try {
    const { correlationId: id } = msg.properties;
    const { code, challengeId, language } = JSON.parse(msg.content.toString());

    validateMessage(code, language, challengeId);

    const results = await launchContainer(id, code, language, challengeId);

    publishToQueue(PRODUCER_QUEUE, JSON.stringify(results), {
      correlationId: msg.properties.correlationId,
    });

    channel.ack(msg);
  } catch (err) {
    publishToQueue(PRODUCER_QUEUE, JSON.stringify({ error: err.msg }), {
      correlationId: msg.properties.correlationId,
    });
    channel.ack(msg);
  }
}

async function main() {
  try {
    await connectAMQP(RABBITMQ_URL);
    setupConsumer(CONSUMER_QUEUE, messageHandler);
  } catch (err) {
    // Log error on closing of launcher
    console.log(err);
  }
}

main();
