const config = require('../config/entorno');
const auth = require('../services/auth.service');
const asyncHandler = require('../utils/async-handler');

exports.createSession = asyncHandler(async (req, res) => {
  const input = req.body;
  const result = await auth.login(input.email, input.password);
  const cookie = config.cookieName;
  const expires = result.expiresAt.toUTCString();
  const secure = config.mode === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${cookie}=${encodeURIComponent(result.token)}; HttpOnly; SameSite=Lax; Path=/api/v1; Expires=${expires}${secure}`);
  res.status(201).json({ user: result.user });
});

exports.deleteSession = asyncHandler(async (req, res) => {
  await auth.logout(req.sessionToken);
  const cookie = config.cookieName;
  const secure = config.mode === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${cookie}=; HttpOnly; SameSite=Lax; Path=/api/v1; Max-Age=0${secure}`);
  res.status(204).end();
});

exports.createDevelopmentUser = asyncHandler(async (req, res) => {
  if (config.mode === 'production' || !config.enableDevSeed) return res.status(404).end();
  res.status(201).json(await auth.createDevelopmentUser(req.body));
});
