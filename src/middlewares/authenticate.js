const auth = require('../services/auth.service');
const asyncHandler = require('../utils/async-handler');
const { AppError } = require('../utils/errors');
module.exports = asyncHandler(async (req, _res, next) => {
  const token = req.cookies[process.env.SESSION_COOKIE_NAME || 'conta_session'];
  if (!token) throw new AppError(401, 'UNAUTHENTICATED', 'Se requiere una sesión válida.');
  req.user = await auth.authenticate(token);
  req.sessionToken = token;
  next();
});
