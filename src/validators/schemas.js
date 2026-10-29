const { z } = require('zod');

const uuid = z.string().uuid();
const account = z.object({
  code: z.string().trim().min(1).max(32).regex(/^[A-Za-z0-9.-]+$/),
  name: z.string().trim().min(1).max(160),
  type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  subtype: z.string().trim().max(80).optional().nullable()
}).strict();
const entry = z.object({
  date: z.iso.date(),
  description: z.string().trim().min(1).max(240),
  lines: z.array(z.object({
    accountId: uuid,
    debit: z.string().regex(/^\d{1,13}(\.\d{1,2})?$/).optional(),
    credit: z.string().regex(/^\d{1,13}(\.\d{1,2})?$/).optional(),
    description: z.string().trim().max(240).optional()
  }).strict()).min(2).max(100)
}).strict();

module.exports = { uuid, account, entry };
