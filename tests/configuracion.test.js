const { applicationConfig, databaseConfig } = require('../src/config/variables');
const { spawnSync } = require('node:child_process');
const valid = {
  NODE_ENV: 'test', PORT: '3000', SESSION_COOKIE_NAME: 'test_session',
  SESSION_TTL_HOURS: '1', ENABLE_DEV_SEED: 'false', DB_HOST: 'localhost',
  DB_PORT: '3306', DB_NAME: 'isolated_test', DB_USER: 'test_user', DB_PASSWORD: 'test-only-value'
};

test.each(Object.keys(valid))('rechaza la variable obligatoria ausente: %s', (key) => {
  const env = { ...valid }; delete env[key];
  expect(() => applicationConfig(env)).toThrow(key);
});
test.each(['PORT', 'DB_PORT', 'SESSION_TTL_HOURS'])('rechaza números inválidos: %s', (key) => {
  for (const value of ['0', '-1', 'NaN', '1.5', '70000', '12x']) {
    expect(() => applicationConfig({ ...valid, [key]: value })).toThrow(key);
  }
});
test('valida opciones de sesión y entorno sin filtrar valores', () => {
  for (const key of ['NODE_ENV', 'SESSION_COOKIE_NAME', 'ENABLE_DEV_SEED']) {
    const secret = 'valor-privado;invalido';
    try { applicationConfig({ ...valid, [key]: secret }); throw new Error('Debió rechazar'); }
    catch (error) { expect(error.message).toContain(key); expect(error.message).not.toContain(secret); }
  }
  expect(() => applicationConfig({ ...valid, NODE_ENV: 'production', ENABLE_DEV_SEED: 'true' })).toThrow('ENABLE_DEV_SEED');
});
test('preserva la contraseña exacta y convierte números', () => {
  const config = applicationConfig({ ...valid, DB_PASSWORD: ' clave con espacios ' });
  expect(config.database.password).toBe(' clave con espacios ');
  expect(config.port).toBe(3000);
  expect(config.sessionTtlHours).toBe(1);
  expect(config.enableDevSeed).toBe(false);
});
test('la migración solo requiere configuración de base de datos', () => {
  const db = Object.fromEntries(Object.entries(valid).filter(([key]) => key.startsWith('DB_')));
  expect(databaseConfig(db).database).toBe('isolated_test');
});
test('el proceso termina antes de arrancar si falta una credencial', () => {
  const env = { ...process.env, ...valid, TEST_ENV_FILE: '__missing_test_environment__' };
  delete env.DB_PASSWORD;
  const result = spawnSync(process.execPath, ['src/server.js'], { env, encoding: 'utf8' });
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain('DB_PASSWORD');
  expect(result.stdout).not.toContain('Servidor disponible');
  expect(result.stderr).not.toContain(valid.DB_PASSWORD);
});
