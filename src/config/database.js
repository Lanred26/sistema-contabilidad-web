const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'contabilidad',
  user: process.env.DB_USER || 'contabilidad_app',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: false,
  dateStrings: true,
  charset: 'utf8mb4'
});

module.exports = pool;
