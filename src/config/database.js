require('./cargar-entorno');
const { Sequelize } = require('sequelize');
const config = require('./variables').databaseConfig(process.env);
module.exports = new Sequelize(config.database, config.user, config.password, {
  host: config.host, port: config.port, dialect: 'mysql', logging: false,
  timezone: '+00:00', dialectOptions: { decimalNumbers: false },
  pool: { max: 10, min: 0, idle: 10000 }
});
