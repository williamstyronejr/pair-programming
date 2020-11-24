const fs = require('fs');
const path = require('path');
const Stream = require('stream');
const Docker = require('dockerode');

const CODE_PATH = path.join(__dirname, '../', 'temp', 'code');
const docker = new Docker({
  socketPath: '/var/run/docker.sock',
  timeout: 15000,
});

/**
 * Creates a file to store the users code in.
 * @param {String} fileName Name of file (should have extension)
 * @param {String} code Code to write to file
 * @return {Promise} A promise to resolve when a file is successfully made.
 */
function createCodeFile(fileName, code) {
  return fs.promises.writeFile(path.join(CODE_PATH, fileName), code, {
    flag: 'w',
  });
}

/**
 * Deletes a user code file.
 * @param {String} fileName Name of code file to delete.
 * @return {Promise<Any>} Returns a promise to resolve when the file is deleted
 */
function deleteCodeFile(fileName) {
  return fs.promises.unlink(path.join(CODE_PATH, fileName));
}

/**
 * Parse test output based on test runner and langauge and returns an uniformly
 *  formatted object.
 * @param {Array|String} output Output of a test runner based on langauge code
 *  was written.
 * @param {String} lang Langauge test results are coming from
 * @return {Object} Returns a object containing information about the test
 *  cases including: name, status, and message.
 */
function parseOutput(output, errOutput, lang) {
  const formattedOutput = {};
  let error;

  switch (lang) {
    case 'node': {
      // Separate jest's JSON output from console output
      const first = output.indexOf('{');
      const last = output.lastIndexOf('}');
      const jsonOut = JSON.parse(output.substr(first, last));

      /**
       * If no test were ran, assume challenge id is invalid since no test file
       *  was found.
       **/
      if (jsonOut.testResults.length === 0) {
        error = new Error('Test for given challenge does not exists.');
        error.msg = 'Challenge does not exists.';
        error.status = 422;
        break;
      }

      // Determine if the entire test has passed, indicating challenge completed
      let success = true;
      formattedOutput.tests = jsonOut.testResults[0].assertionResults.map(
        (test) => {
          if (test.status === 'failed') success = false;
          return {
            name: test.title,
            status: success,
            message:
              test.failureMessages.length > 0 ? test.failureMessages[0] : '',
          };
        }
      );

      formattedOutput.success = success;
      break;
    }

    default: {
      const err = new Error('Invalid or unsupported langauge.');
      err.status = 422;
      err.msg = 'Invalid or unsupported langauge requested.';
      throw err;
    }
  }

  if (error) throw error;
  return formattedOutput;
}

/**
 * Creates and start container to run code. Container will only run for
 *  15 seconds before stopping to prevent prolong usage.
 * @param {String} jobId Id of the queue job
 * @param {String} code Code to run in container
 * @param {String} language The langauge/platform to run the code in
 * @param {String} challengeId Challenge id used to select test cases to run
 * @return {Promise<any>} A promise to resolve the code was ran and log was stored.
 */
async function launchContainer(queueId, code, language, challengeId) {
  let fileName; // File name including extention for
  let commands; // List of commands to run (changes based on langauge)

  // Determine extension of file based on language
  switch (language.toLowerCase()) {
    case 'node':
      fileName = `${queueId}.js`;
      commands = [
        'npm',
        'test',
        '--',
        challengeId,
        '--passWithNoTests',
        '--json',
      ];
      break;

    default: {
      const err = new Error('Invalid or unsupported language.');
      err.msg = `Invalid/unsupported langauge: ${language}`;
      err.status = 422;
      err.errors = { lang: 'Invalid or unsupported langauge selected.' };
      throw err;
    }
  }

  await createCodeFile(fileName, code);

  return new Promise((res, rej) => {
    try {
      // Options for volume setup
      const options = {
        Tty: false,
        Binds: [
          `${path.join(__dirname, '../', 'challengeTests')}:/app/src/tests`,
          `${path.join(
            __dirname,
            '../',
            'temp',
            'code',
            fileName
          )}:/app/src/${fileName}`,
        ],
        Env: [`FILENAME=${fileName}`],
      };

      let dockerOutput = '';
      let errOutput = '';
      const chunks = [];
      const errChunks = [];
      const outStream = new Stream.Writable();
      const streamErr = new Stream.Writable();

      streamErr._write = (chunk, encoding, cb) => {
        errChunks.push(chunk);
        cb();
      };

      outStream._write = (chunk, encoding, cb) => {
        chunks.push(chunk);
        cb();
      };

      outStream.on('finish', () => {
        dockerOutput = Buffer.concat(chunks).toString('utf8');
        errOutput = Buffer.concat(errChunks).toString('utf8');

        try {
          deleteCodeFile(fileName);
          return res(parseOutput(dockerOutput, errOutput, language));
        } catch (err) {
          return rej(err);
        }
      });

      docker.run('launcher0.1', commands, [outStream, streamErr], options);
    } catch (err) {
      rej(err);
    }
  });
}

module.exports.launchContainer = launchContainer;
