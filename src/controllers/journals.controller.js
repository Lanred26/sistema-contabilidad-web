const service = require('../services/journals.service');
const audit = require('../repositories/audit.repository');
const asyncHandler = require('../utils/async-handler');
const crypto = require('node:crypto');

exports.create = asyncHandler(async (req, res) => {
  const input = req.body;
  const result = await service.create(req.company.id, req.user.id, input);
  await audit.record({ id: crypto.randomUUID(), userId: req.user.id, companyId: req.company.id, action: 'JOURNAL_POSTED', resourceType: 'journal_entry', resourceId: result.id, requestId: req.requestId });
  res.status(201).json({ data: result });
});
exports.ledger = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  if (from > to) return res.status(422).json({ code: 'INVALID_DATE_RANGE', message: '`from` debe ser anterior o igual a `to`.', requestId: req.requestId });
  res.json({ data: await service.ledger(req.company.id, req.params.accountId, from, to) });
});
