const service = require('../services/journals.service');
const audit = require('../repositories/audit.repository');
const asyncHandler = require('../utils/async-handler');
const { entry, uuid } = require('../validators/schemas');
const { z } = require('zod');
const crypto = require('node:crypto');

exports.create = asyncHandler(async (req, res) => {
  const input = entry.parse(req.body);
  const result = await service.create(req.company.id, req.user.id, input);
  await audit.record({ id: crypto.randomUUID(), userId: req.user.id, companyId: req.company.id, action: 'JOURNAL_POSTED', resourceType: 'journal_entry', resourceId: result.id, requestId: req.requestId });
  res.status(201).json({ data: result });
});
exports.ledger = asyncHandler(async (req, res) => {
  const accountId = uuid.parse(req.params.accountId);
  const query = z.object({ from: z.iso.date(), to: z.iso.date() }).strict().parse(req.query);
  if (query.from > query.to) return res.status(422).json({ code: 'INVALID_DATE_RANGE', message: '`from` debe ser anterior o igual a `to`.', requestId: req.requestId });
  res.json({ data: await service.ledger(req.company.id, accountId, query.from, query.to) });
});
