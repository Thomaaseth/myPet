// jest.config.js
module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: ['**/*.test.js'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/server.js'
    ]
  };