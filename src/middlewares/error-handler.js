const { AppError } = require('../utils/errors');
module.exports = (error, req, res, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) return res.status(400).json({ code: 'MALFORMED_JSON', message: 'El cuerpo JSON no es válido.', requestId: req.requestId });
  const status = error instanceof AppError ? error.status : 500;
  if (status >= 500) console.error({ requestId: req.requestId, error: error.message });
  return res.status(status).json({ code: error.code || 'INTERNAL_ERROR', message: status >= 500 ? 'Ocurrió un error interno.' : error.message, requestId: req.requestId });
};
