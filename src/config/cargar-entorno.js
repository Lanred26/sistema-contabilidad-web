require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? (process.env.TEST_ENV_FILE || '.env.test') : '.env', quiet: true });
