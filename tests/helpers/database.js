const mysql = require('mysql2/promise');
const config = require('../../src/config/variables').databaseConfig(process.env);
if (process.env.NODE_ENV !== 'test' || config.database !== process.env.TEST_DB_NAME || !config.database.endsWith('_test')) {
  throw new Error('Las pruebas requieren una base aislada con sufijo _test.');
}
const pool = mysql.createPool({ ...config, dateStrings: true, decimalNumbers: false });
module.exports = {
  execute: (...args) => pool.execute(...args),
  end: async () => { await pool.end(); await require('../../src/config/database').close(); }
};
