function required(env, name) {
  const value = env[name];
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Falta la variable obligatoria ${name}.`);
  return value;
}
function integer(env, name, max) {
  const value = required(env, name);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1 || Number(value) > max) {
    throw new Error(`La variable ${name} debe ser un entero entre 1 y ${max}.`);
  }
  return Number(value);
}
function databaseConfig(env) {
  return Object.freeze({
    host: required(env, 'DB_HOST'), port: integer(env, 'DB_PORT', 65535),
    database: required(env, 'DB_NAME'), user: required(env, 'DB_USER'),
    password: required(env, 'DB_PASSWORD')
  });
}
function applicationConfig(env) {
  const mode = required(env, 'NODE_ENV');
  if (!['development', 'test', 'production'].includes(mode)) throw new Error('NODE_ENV debe ser development, test o production.');
  const cookieName = required(env, 'SESSION_COOKIE_NAME');
  if (!/^[A-Za-z0-9_-]+$/.test(cookieName)) throw new Error('SESSION_COOKIE_NAME contiene caracteres no permitidos.');
  const seed = required(env, 'ENABLE_DEV_SEED');
  if (!['true', 'false'].includes(seed)) throw new Error('ENABLE_DEV_SEED debe ser true o false.');
  if (mode === 'production' && seed === 'true') throw new Error('ENABLE_DEV_SEED debe ser false en producción.');
  return Object.freeze({ mode, port: integer(env, 'PORT', 65535), cookieName,
    sessionTtlHours: integer(env, 'SESSION_TTL_HOURS', 8760), enableDevSeed: seed === 'true',
    database: databaseConfig(env)
  });
}
module.exports = { applicationConfig, databaseConfig };
