const service = require('../services/accounts.service');
const audit = require('../repositories/audit.repository');
const asyncHandler = require('../utils/async-handler');
const crypto = require('node:crypto');

exports.list = asyncHandler(async (req, res) => res.json({ data: await service.list(req.company.id) }));
exports.create = asyncHandler(async (req, res) => {
  const result = await service.create(req.company.id, req.body);
  await audit.record({ id: crypto.randomUUID(), userId: req.user.id, companyId: req.company.id, action: 'ACCOUNT_CREATED', resourceType: 'account', resourceId: result.id, requestId: req.requestId });
  res.status(201).json({ data: result });
});
exports.update = asyncHandler(async (req, res) => {
  const result = await service.update(req.company.id, req.params.accountId, req.body);
  await audit.record({ id: crypto.randomUUID(), userId: req.user.id, companyId: req.company.id, action: 'ACCOUNT_UPDATED', resourceType: 'account', resourceId: result.id, requestId: req.requestId });
  res.json({ data: result });
});
