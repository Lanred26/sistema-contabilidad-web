require('dotenv').config({ path: process.env.TEST_ENV_FILE || '.env.test' });

module.exports = {
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.js'],
    testTimeout: 20000,
    hookTimeout: 20000
  }
};
