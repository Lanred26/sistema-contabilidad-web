const { AppError } = require('../utils/errors');
module.exports = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.company?.role)) return next(new AppError(403, 'FORBIDDEN', 'No tienes permiso para realizar esta acción.'));
  next();
};
