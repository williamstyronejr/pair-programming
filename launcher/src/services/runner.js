const util = require('util');
const fs = require('fs');
const path = require('path');
const { VM, NodeVM } = require('vm2');

const readFileAsync = util.promisify(fs.readFile);

/**
 * Creates a VM to run user supplied code in a sandbox environment,
 *  and log the results to a file for launcher to read from.
 * @param {String} fileName Name of file containing code to run
 * @return {String} Returns the output of running the code by call main function.
 */
async function runCode(fileName, params) {
  const vm = new VM({
    timeout: 10000,
    sandbox: {
      params,
    },
  });

  let code = await readFileAsync(path.join(__dirname, fileName), 'utf8');

  // Add line to call user's function with given test parameters
  code = code.concat(`main(...params)`);

  try {
    const result = await vm.run(code);
    return result;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
}

exports.runCode = runCode;
