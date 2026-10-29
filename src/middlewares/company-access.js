const db = require('../config/database');
const asyncHandler = require('../utils/async-handler');
const { AppError } = require('../utils/errors');
module.exports = asyncHandler(async (req, _res, next) => {
  const companyId = req.params.companyId;
  const [rows] = await db.execute('SELECT role FROM memberships WHERE user_id = ? AND company_id = ? AND active = TRUE', [req.user.id, companyId]);
  if (!rows[0]) throw new AppError(404, 'COMPANY_NOT_FOUND', 'No se encontró la empresa.');
  req.company = { id: companyId, role: rows[0].role };
  next();
});
