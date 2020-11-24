const { runCode } = require('../index');

const { FILENAME } = process.env;

test('N is larger than the array size should return -1', async () => {
  const params = [2, 2];
  const solution = 4;

  const results = await runCode(FILENAME, params);

  expect(results).toBe(solution);
});

test('', async () => {
  const params = [3, 2];
  const solution = 9;

  const results = await runCode(FILENAME, params);
  expect(results).toBe(solution);
});
