module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/*.test.js', '**/tests/*.test.js'],
  verbose: false,
  collectCoverage: true,
  setupFilesAfterEnv: ['<rootDir>src/setupTests.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'services/**/*.js',
    'middlewares/**/*.js',
  ],
};
