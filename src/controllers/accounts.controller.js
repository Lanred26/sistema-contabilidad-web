const service = require('../services/accounts.service');
const audit = require('../repositories/audit.repository');
const asyncHandler = require('../utils/async-handler');
const { account, uuid } = require('../validators/schemas');
const { z } = require('zod');
const crypto = require('node:crypto');

exports.list = asyncHandler(async (req, res) => res.json({ data: await service.list(req.company.id) }));
exports.create = asyncHandler(async (req, res) => {
  const input = account.parse(req.body);
  const result = await service.create(req.company.id, input);
  await audit.record({ id: crypto.randomUUID(), userId: req.user.id, companyId: req.company.id, action: 'ACCOUNT_CREATED', resourceType: 'account', resourceId: result.id, requestId: req.requestId });
  res.status(201).json({ data: result });
});
exports.update = asyncHandler(async (req, res) => {
  const id = uuid.parse(req.params.accountId);
  const input = z.object({ name: account.shape.name.optional(), type: account.shape.type.optional(), subtype: account.shape.subtype, active: z.boolean().optional() }).strict().refine((value) => Object.keys(value).length > 0).parse(req.body);
  const result = await service.update(req.company.id, id, input);
  await audit.record({ id: crypto.randomUUID(), userId: req.user.id, companyId: req.company.id, action: 'ACCOUNT_UPDATED', resourceType: 'account', resourceId: result.id, requestId: req.requestId });
  res.json({ data: result });
});
