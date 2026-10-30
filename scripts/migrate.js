require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

(async () => {
  const database = process.env.DB_NAME || 'contabilidad';
  const connection = await mysql.createConnection({ host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'contabilidad_app', password: process.env.DB_PASSWORD || '', database, multipleStatements: false });
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    for (const statement of sql.split(';').map((part) => part.trim()).filter(Boolean)) await connection.query(statement);
    console.log(`Esquema aplicado en ${database}.`);
  } finally { await connection.end(); }
})().catch((error) => { console.error(`No se pudo aplicar el esquema: ${error.message}`); process.exitCode = 1; });
