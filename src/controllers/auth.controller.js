const bcrypt = require('bcryptjs');
const auth = require('../services/auth.service');
const asyncHandler = require('../utils/async-handler');
const db = require('../config/database');
const crypto = require('node:crypto');
const { z } = require('zod');

exports.createSession = asyncHandler(async (req, res) => {
  const input = z.object({ email: z.email().max(254), password: z.string().min(1).max(128) }).strict().parse(req.body);
  const result = await auth.login(input.email, input.password);
  const cookie = process.env.SESSION_COOKIE_NAME || 'conta_session';
  res.cookie(cookie, result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: result.expiresAt, path: '/api/v1' });
  res.status(201).json({ user: result.user });
});

exports.deleteSession = asyncHandler(async (req, res) => {
  await auth.logout(req.sessionToken);
  res.clearCookie(process.env.SESSION_COOKIE_NAME || 'conta_session', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/v1' });
  res.status(204).end();
});

exports.createDevelopmentUser = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DEV_SEED !== 'true') return res.status(404).end();
  const input = z.object({ email: z.email().max(254), password: z.string().min(12).max(128), name: z.string().min(1).max(160), companyName: z.string().min(1).max(160), role: z.enum(['ADMIN', 'ACCOUNTANT', 'VIEWER']).default('ADMIN') }).strict().parse(req.body);
  const connection = await db.getConnection();
  const userId = crypto.randomUUID(); const companyId = crypto.randomUUID();
  try {
    await connection.beginTransaction();
    const passwordHash = await bcrypt.hash(input.password, 12);
    await connection.execute('INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)', [userId, input.email.trim().toLowerCase(), passwordHash, input.name]);
    await connection.execute('INSERT INTO companies (id, name) VALUES (?, ?)', [companyId, input.companyName]);
    await connection.execute('INSERT INTO memberships (id, user_id, company_id, role) VALUES (?, ?, ?, ?)', [crypto.randomUUID(), userId, companyId, input.role]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ code: 'EMAIL_EXISTS', message: 'Ya existe una cuenta con ese correo.', requestId: req.requestId });
    throw error;
  } finally { connection.release(); }
  res.status(201).json({ userId, companyId });
});
