const {
  findChallenge,
  getChallengeList,
  createChallenge,
  compareSolution,
} = require('../challenge');
const { connectDatabase, disconnectDatabase } = require('../database');

const { DB_TEST_URI } = process.env;

beforeAll(async () => {
  await connectDatabase(DB_TEST_URI);
});

afterAll(async () => {
  await disconnectDatabase();
});

describe('Creating challenges', () => {
  test('Successfully creating challenge should response with challenge object', async () => {
    const title = 'title';
    const prompt = 'prompt';
    const solution = 'solution';
    const tags = 'mklfdsa,mkldfsa';

    const challenge = await createChallenge(title, prompt, solution, tags);

    expect(challenge).toBeDefined();
    expect(typeof challenge).toBe('object');
    expect(challenge.title).toBe(title);
    expect(challenge.prompt).toBe(prompt);
    expect(challenge.solution).toBe(solution);
    expect(challenge.tags).toBe(tags);
  });
});

describe('Find challenges', () => {
  const numToCreate = 10; // Number of challenges to create;
  let challenges; // Array of challenges

  // Create 3 challenges
  beforeAll(async () => {
    const proms = []; // List of promises
    for (let i = 1; i <= numToCreate; i++) {
      proms.push(
        createChallenge(`title${i}`, `prompt${i}`, `solution${i}`, `tags${i}`)
      );
    }

    challenges = await Promise.all(proms);
  }, 20000);

  test('Single challenge by id', async () => {
    const challenge = await findChallenge(challenges[0].id);
    expect(challenge).toBeDefined();

    expect(challenge.id).toBe(challenges[0].id);
    expect(challenge.title).toBe(challenges[0].title);
    expect(challenge.prompt).toBe(challenges[0].prompt);
    expect(challenge.solution).toBe(challenges[0].solution);
    expect(challenge.tags).toBe(challenges[0].tags);
  }, 10000);

  test('Finding list of challenges', async () => {
    const limit = 4;
    const skip = 0;

    // Makes sure to not skip more than created, there's another test for this.
    expect(skip).toBeLessThan(numToCreate);

    const list = await getChallengeList(skip, limit);

    expect(list).toBeDefined();
    expect(list.length).toBeLessThanOrEqual(limit);
  });
});

describe('Comparing Solution', () => {
  let challenge;
  const title = 'title';
  const prompt = 'prompt';
  const solution = 'test';
  const tags = 'tag1,tag2';

  beforeAll(async () => {
    challenge = await createChallenge(title, prompt, solution, tags);
  }, 10000);

  test('Correct solution', async () => {
    const c = await compareSolution(challenge.id, solution);
    expect(c).toBeDefined();
  });

  test('Incorrect solution', async () => {
    const c = await compareSolution(challenge.id, `${solution}1`);

    expect(c).toBeNull();
  });
});
