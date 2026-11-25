const auth = require('../services/auth.service');
const asyncHandler = require('../utils/async-handler');
module.exports = asyncHandler(async (req, _res, next) => {
  req.company = await auth.companyAccess(req.user.id, req.params.companyId);
  next();
});
