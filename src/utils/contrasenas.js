const crypto = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(crypto.scrypt);
const DUMMY_SALT = Buffer.alloc(16).toString('hex');
const DUMMY_HASH = crypto.scryptSync('clave-que-no-corresponde', DUMMY_SALT, 64).toString('hex');

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, expectedHex] = (storedHash || `${DUMMY_SALT}:${DUMMY_HASH}`).split(':');
  const expected = Buffer.from(expectedHex || DUMMY_HASH, 'hex');
  const actual = await scrypt(password, salt || DUMMY_SALT, expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

module.exports = { hashPassword, verifyPassword, DUMMY_HASH };
