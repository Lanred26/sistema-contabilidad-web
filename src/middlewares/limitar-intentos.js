const { rateLimit } = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({
    code: 'LOGIN_RATE_LIMITED',
    message: 'Demasiados intentos. Intenta más tarde.',
    requestId: req.requestId
  })
});
