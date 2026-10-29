const auth = require('../services/auth.service');
const asyncHandler = require('../utils/async-handler');
const db = require('../config/database');
const crypto = require('node:crypto');
const { hashPassword } = require('../utils/contrasenas');

exports.createSession = asyncHandler(async (req, res) => {
  const input = req.body;
  const result = await auth.login(input.email, input.password);
  const cookie = process.env.SESSION_COOKIE_NAME || 'conta_session';
  const expires = result.expiresAt.toUTCString();
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${cookie}=${encodeURIComponent(result.token)}; HttpOnly; SameSite=Lax; Path=/api/v1; Expires=${expires}${secure}`);
  res.status(201).json({ user: result.user });
});

exports.deleteSession = asyncHandler(async (req, res) => {
  await auth.logout(req.sessionToken);
  const cookie = process.env.SESSION_COOKIE_NAME || 'conta_session';
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${cookie}=; HttpOnly; SameSite=Lax; Path=/api/v1; Max-Age=0${secure}`);
  res.status(204).end();
});

exports.createDevelopmentUser = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DEV_SEED !== 'true') return res.status(404).end();
  const input = req.body;
  const connection = await db.getConnection();
  const userId = crypto.randomUUID(); const companyId = crypto.randomUUID();
  try {
    await connection.beginTransaction();
    const passwordHash = await hashPassword(input.password);
    await connection.execute('INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)', [userId, input.email.trim().toLowerCase(), passwordHash, input.name]);
    await connection.execute('INSERT INTO companies (id, name) VALUES (?, ?)', [companyId, input.companyName]);
    await connection.execute('INSERT INTO memberships (id, user_id, company_id, role) VALUES (?, ?, ?, ?)', [crypto.randomUUID(), userId, companyId, input.role || 'ADMIN']);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ code: 'EMAIL_EXISTS', message: 'Ya existe una cuenta con ese correo.', requestId: req.requestId });
    throw error;
  } finally { connection.release(); }
  res.status(201).json({ userId, companyId });
});
