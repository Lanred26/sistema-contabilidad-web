const config = require('../config/entorno');
const crypto = require('node:crypto');
const repo = require('../repositories/auth.repository');
const { AppError } = require('../utils/errors');
const { hashPassword, verifyPassword, DUMMY_HASH } = require('../utils/contrasenas');

const digest = (token) => crypto.createHash('sha256').update(token).digest('hex');
async function login(email, password) {
  const user = await repo.findUserByEmail(email.trim().toLowerCase());
  const passwordValid = await verifyPassword(password, user?.password_hash || `${Buffer.alloc(16).toString('hex')}:${DUMMY_HASH}`);
  const valid = Boolean(user && user.active && passwordValid);
  if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Correo o contraseña no válidos.');
  const token = crypto.randomBytes(32).toString('base64url');
  const ttl = config.sessionTtlHours;
  const expiresAt = new Date(Date.now() + ttl * 3600000);
  await repo.createSession({ id: crypto.randomUUID(), userId: user.id, tokenHash: digest(token), expiresAt });
  return { token, expiresAt, user: { id: user.id, email: user.email, name: user.full_name, companies: await repo.memberships(user.id) } };
}
async function authenticate(token) {
  const session = await repo.findSession(digest(token));
  if (!session) throw new AppError(401, 'UNAUTHENTICATED', 'Se requiere una sesión válida.');
  return { id: session.id, email: session.email, name: session.full_name, sessionId: session.session_id };
}
async function logout(token) { await repo.revokeSession(digest(token)); }
async function companyAccess(userId, companyId) {
  const membership = await repo.findMembership(userId, companyId);
  if (!membership) throw new AppError(404, 'COMPANY_NOT_FOUND', 'No se encontró la empresa.');
  return { id: companyId, role: membership.role };
}
async function createDevelopmentUser(input) {
  const userId = crypto.randomUUID(); const companyId = crypto.randomUUID();
  try {
    return await repo.createDevelopmentUser({ userId, companyId, membershipId: crypto.randomUUID(),
      email: input.email.trim().toLowerCase(), passwordHash: await hashPassword(input.password),
      name: input.name, companyName: input.companyName, role: input.role || 'ADMIN' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new AppError(409, 'EMAIL_EXISTS', 'Ya existe una cuenta con ese correo.');
    throw error;
  }
}
module.exports = { login, authenticate, logout, companyAccess, createDevelopmentUser };
