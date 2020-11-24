const { launchContainer } = require('../launcher');

describe('Running node code in docker', () => {
  const testCode = `
    function main(num, pow) {
      return Math.pow(num, pow)
    }
  `;

  test('Invalid or unsupported langauge throws 422 error with message', async () => {
    const type = 'non';
    const queueId = 'fmkdslfdsc';
    const challengeId = '1234dksal';

    try {
      await launchContainer(queueId, testCode, type, challengeId);
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.status).toBe(422);
      expect(err.msg).toBeDefined();
    }
  });

  test('Invalid challenge id should throw 422 error with message', async () => {
    const langauge = 'node';
    const challengeId = 'fdkslafm';
    const queueId = 'fdskflsdnmf';

    try {
      await launchContainer(queueId, testCode, langauge, challengeId);
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.status).toBe(422);
      expect(err.msg).toBeDefined();
    }
  });

  test('Valid parameters should response with object containing results', async () => {
    const langauge = 'node';
    const queueId = 'dfmklafd';
    const challengeId = 'index'; // Should be a test file in tests folder

    const results = await launchContainer(
      queueId,
      testCode,
      langauge,
      challengeId
    );

    expect(results).toBeDefined();
    expect(typeof results).toBe('object');
    expect(results.tests).toBeDefined();
    expect(Array.isArray(results.tests));
  });
});
