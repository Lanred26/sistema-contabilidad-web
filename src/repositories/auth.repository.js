const db = require('../config/database');

async function findUserByEmail(email) {
  const [rows] = await db.execute('SELECT id, email, password_hash, full_name, active FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}
async function createSession({ id, userId, tokenHash, expiresAt }) {
  await db.execute('INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)', [id, userId, tokenHash, expiresAt]);
}
async function findSession(tokenHash) {
  const [rows] = await db.execute(`SELECT s.id AS session_id, u.id, u.email, u.full_name
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > UTC_TIMESTAMP() AND u.active = TRUE`, [tokenHash]);
  return rows[0] || null;
}
async function revokeSession(tokenHash) {
  await db.execute('UPDATE sessions SET revoked_at = UTC_TIMESTAMP() WHERE token_hash = ? AND revoked_at IS NULL', [tokenHash]);
}
async function memberships(userId) {
  const [rows] = await db.execute('SELECT m.company_id, m.role FROM memberships m JOIN companies c ON c.id = m.company_id WHERE m.user_id = ? AND m.active = TRUE', [userId]);
  return rows;
}
module.exports = { findUserByEmail, createSession, findSession, revokeSession, memberships };
