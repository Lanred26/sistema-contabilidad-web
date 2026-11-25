const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({
      code: 'VALIDATION_ERROR',
      message: 'La solicitud contiene datos inválidos.',
      requestId: req.requestId,
      details: result.array().map(({ path, msg }) => ({ field: path, message: msg }))
    });
  }
  next();
};
