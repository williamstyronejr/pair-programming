const path = require('path');
const fs = require('fs');

const { CHALLENGEID: TESTNAME } = process.env;

const log = console.log;
let tests = [];
let passedTests = 0;
let failedTests = 0;
let totalTests = 0;
let currentTest = {};
let currentDescribe = {
  test: [],
  name: '',
};
let stats = [];

const flex = {
  fn: function (cb) {
    let calls = [];
    let returnValues = [];
    calls.push();
    if (cb) cb();

    return {
      mock: {
        calls,
        returnValues,
      },
    };
  },
  mock: function (params) {},
};

// async function describe(describeName, fn) {
//   currentDescribe = {
//     test: [],
//   };

//   currentDescribe.name = describeName;
//   await fn.apply(this);

//   // Add results to stats and reset describe
//   stats.push(currentDescribe);
//   currentDescribe = { test: [], name: '' };
// }

// async function test(testName, fn, timeout = 5000) {
//   totalTests++;

//   currentTest = {
//     name: testName,
//     expects: [],
//   };

//   await new Promise((res, rej) => {
//     // const timer = setTimeout(() => {
//     //   rej(`Async function not completed in ${timeout} ms.`);
//     // }, timeout);
//     // console.log(fn.toString());
//     fn.apply(this, [res]);
//     // fn.apply(this, () => {
//     //   clearInterval(timer);
//     //   res();
//     // });
//   })
//     .then((re) => {
//       currentDescribe.test.push(currentTest);
//     })
//     .catch((err) => {
//       currentDescribe.test.push({ name: testName, error: err });
//     });
// }

function test(name, fn, timeout = 5000) {
  tests.push({ name, fn, timeout });
}

async function runTests() {
  let proms = [];
  tests.forEach(async (test) => {
    currentTest = { name: test.name, expects: [] };

    proms.push(
      new Promise((res, rej) => {
        // const timer = setTimeout(() => {
        //   rej(`Async function not completed in ${timeout} ms.`);
        // }, timeout);
        // console.log(fn.toString());
        try {
          test.fn.apply(this, [res]);
          // fn.apply(this, () => {
          //   clearInterval(timer);
          //   res();
          // });

          // Store test results
          stats.push(currentTest);
        } catch (err) {
          stats.push({ name: test.name, error: err });
        }
      })
    );
  });

  return Promise.all(proms);
}

/**
 *
 * @param {*} val
 */
function expect(val) {
  return {
    toBe: (expected) => {
      if (val === expected) {
        currentTest.expects.push({
          name: `Expected: ${expected} === Receieve: ${val}`,
          status: true,
        });
        passedTests++;
      } else {
        currentTest.expects.push({
          name: `Expected: ${expected} !== Receieve: ${val}`,
          status: false,
        });
        failedTests++;
      }
    },
  };
}

function showResults() {
  const outputJson = {
    numOfTests: totalTests,
    passedTests,
    failedTests,
    time: 0,
    testResults: stats,
  };

  log('made it');
  log(JSON.stringify(outputJson));
}

// global.flex = flex;
// global.describe = describe;
global.test = test;
global.expect = expect;

/**
 * Checks if a test folder exists
 * @return {Boolean} Returns a boolean indicating if a test folder was found.
 */
function searchTestFolder() {
  if (!fs.existsSync('/app/src/tests/')) return false;
  return true;
}

function getTestFiles() {
  let f = null;

  if ((f = fs.readdirSync(`tests/`))) return f.length === 0 ? null : f;
}

async function runTestFiles(f = []) {
  // f.forEach((file) => {
  require(fs.realpathSync(`src/tests/${TESTNAME}.test.js`));
  // });

  // Run all tests
  return runTests();
}

async function run() {
  if (searchTestFolder()) {
    let files;
    if (true) {
      log('Running tests');
      await runTestFiles(files);
      showResults();

      log('Finished running tests');
    } else {
      log('No test files found.');
    }
  } else {
    log('No test folder found');
  }
}

run();
