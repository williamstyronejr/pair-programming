const fs = require('fs');
const path = require('path');
const Docker = require('dockerode');

const docker = new Docker({
  socketPath: '/var/run/docker.sock',
  timeout: 15000
});

/**
 * Creates a file to store the users code in.
 * @param {string} fileName Name of file (should have extension)
 * @param {string} code Code to write to file
 * @return {Promise} A promise to resolve when a file is successfully made.
 */
function createCodeFile(fileName, code) {
  return fs.promises.writeFile(
    path.join(__dirname, '../', 'temp/', 'code/', fileName),
    code,
    { flag: 'w' }
  );
}

/**
 * Gets content from a log file from docker container.
 * @param {string} fileName Name of file to read from
 * @return {Promise} A promise to resolve with the content of the file.
 */
function getLogFile(fileName) {
  return fs.promises.readFile(
    path.join(__dirname, '../', 'temp/', 'log/', fileName),
    'utf8'
  );
}

/**
 * Creates and start container to run code. Container will only run for
 *  15 seconds before stopping to prevent prolong usage.
 * @param {string} fileName Name of file to store code in, (without extension)
 * @param {string} code Code to run in container
 * @param {string} type The langauge/platform to run the code in.
 * @return {Promise} A promise to resolve the code was ran and log was stored.
 */
async function runCodeContainer(fileName, code, type = 'node') {
  let ext;

  // Determine extension of file based of type
  switch (type.toLowerCase()) {
    case 'node':
      ext = 'js';
      break;

    default:
      throw new Error('No file type given.');
  }

  try {
    await createCodeFile(`${fileName}.${ext}`, code);

    // Options for volume setup
    const options = {
      Binds: [path.join(__dirname, '../temp:/local')]
    };

    const container = await docker.run(
      'launchv0.1',
      ['npm', 'start', `filename=${fileName}`],
      null,
      options
    );

    return await getLogFile(`${fileName}.json`);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports.runCodeContainer = runCodeContainer;
