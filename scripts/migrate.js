require('../src/config/cargar-entorno');
const config = require('../src/config/variables').databaseConfig(process.env);
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

(async () => {
  const database = config.database;
  const connection = await mysql.createConnection({ ...config, multipleStatements: false });
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    for (const statement of sql.split(';').map((part) => part.trim()).filter(Boolean)) await connection.query(statement);
    console.log(`Esquema aplicado en ${database}.`);
  } finally { await connection.end(); }
})().catch((error) => { console.error('No se pudo aplicar el esquema. Revisa la conexión y los permisos locales.'); process.exitCode = 1; });
