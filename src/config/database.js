require('./cargar-entorno');
const mysql = require('mysql2/promise');
const { databaseConfig } = require('./variables');
module.exports = mysql.createPool({
  ...databaseConfig(process.env),
  waitForConnections: true, connectionLimit: 10, decimalNumbers: false,
  dateStrings: true, charset: 'utf8mb4'
});
