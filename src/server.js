const app = require('./app');
const db = require('./config/database');
const port = Number(process.env.PORT || 3000);
const server = app.listen(port, () => console.log(`API disponible en http://localhost:${port}`));
async function shutdown() {
  server.close(async () => { await db.end(); process.exit(0); });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
