const { runCodeContainer } = require('../launcher');

describe('Running node code in docker', () => {
  const solution = 123;
  const testCode = `
    function functionToTest() {
      return 120+3
    }

    functionToTest();
  `;

  test('Invalid langauge type throws error', async () => {
    const type = 'non';

    try {
      const results = JSON.parse(await runCodeContainer('123', testCode, type));
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  test('Successfully runs with correct solution', async () => {
    const results = JSON.parse(await runCodeContainer('123', testCode));

    expect(results).toBeDefined();
    expect(results.result).toBe(solution);
  });
});
