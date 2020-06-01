const util = require('util');
const fs = require('fs');
const { VM } = require('vm2');

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

/**
 *
 * @param {string} fileName Name of log file. (Should match the code file)
 * @param {string} content Data to store in file.
 * @return {Promise} A promise to resolve when log file is created or throw an
 *   error if one occurs.
 */
function logResults(fileName, content) {
  return writeFileAsync(`/local/log/${fileName}.json`, content);
}

/**
 * Creates a VM to run user supplied code in a sandbox environment,
 *  and log the results to a file for launcher to read from.
 * @param {string} fileName Name of file containing code to run
 */
async function runCode(fileName) {
  let code;
  try {
    code = await readFileAsync(`/local/code/${fileName}.js`, 'utf-8');
  } catch (err) {
    return;
  }

  const vm = new VM({
    timeout: 10000,
    sandbox: {}
  });

  try {
    const result = await vm.run(code);
    await logResults(fileName, JSON.stringify({ result }));
  } catch (err) {
    // Log errors that occurred
    await logResults(
      fileName,
      JSON.stringify({
        error: err.message
      })
    );
  }
}

// Get name of code file
const fileName = process.argv[2].split('=')[1];
runCode(fileName);
