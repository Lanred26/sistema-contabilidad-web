const config = require('./config/entorno');
const app = require('./app');
const db = require('./config/database');

class Server {
  constructor({ port, app }) {
    this.port = port;
    this.app = app;
    this.httpServer = null;
  }

  async start() {
    await db.authenticate();
    this.httpServer = this.app.listen(this.port, () => {
      console.log(`Servidor disponible en http://localhost:${this.port}`);
    });
    return this.httpServer;
  }

  async stop() {
    if (this.httpServer) await new Promise((resolve, reject) => this.httpServer.close((error) => error ? reject(error) : resolve()));
    await db.close();
  }
}

if (require.main === module) {
  const server = new Server({ port: config.port, app });
  server.start().catch((error) => {
    console.error('No se pudo iniciar el servidor. Revisa la conexión y configuración local.');
    process.exitCode = 1;
  });
  process.on('SIGINT', () => server.stop().then(() => process.exit(0)));
  process.on('SIGTERM', () => server.stop().then(() => process.exit(0)));
}

module.exports = { Server };
