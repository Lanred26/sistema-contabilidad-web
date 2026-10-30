require('dotenv').config();
const app = require('./app');
const db = require('./config/database');

class Server {
  constructor({ port, app }) {
    this.port = port;
    this.app = app;
    this.httpServer = null;
  }

  async start() {
    await db.query('SELECT 1');
    this.httpServer = this.app.listen(this.port, () => {
      console.log(`Servidor disponible en http://localhost:${this.port}`);
    });
    return this.httpServer;
  }

  async stop() {
    if (this.httpServer) await new Promise((resolve, reject) => this.httpServer.close((error) => error ? reject(error) : resolve()));
    await db.end();
  }
}

if (require.main === module) {
  const server = new Server({ port: Number(process.env.PORT || 3000), app });
  server.start().catch((error) => {
    console.error(`No se pudo iniciar el servidor: ${error.message}`);
    process.exitCode = 1;
  });
  process.on('SIGINT', () => server.stop().then(() => process.exit(0)));
  process.on('SIGTERM', () => server.stop().then(() => process.exit(0)));
}

module.exports = { Server };
