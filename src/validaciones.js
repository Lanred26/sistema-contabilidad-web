const { body, param, query } = require('express-validator');

const validateCompany = param('companyId').isUUID().withMessage('El identificador de empresa no es válido.');
const validateAccountId = param('accountId').isUUID().withMessage('El identificador de cuenta no es válido.');
const validateAccount = [
  body('code').isString().trim().isLength({ min: 1, max: 32 }).matches(/^[A-Za-z0-9.-]+$/),
  body('name').isString().trim().isLength({ min: 1, max: 160 }),
  body('type').isIn(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  body('subtype').optional({ nullable: true }).isString().trim().isLength({ max: 80 }),
  body().custom((value) => Object.keys(value || {}).every((key) => ['code', 'name', 'type', 'subtype'].includes(key))).withMessage('La solicitud contiene campos no permitidos.')
];
const validateAccountUpdate = [
  validateAccountId,
  body('name').optional().isString().trim().isLength({ min: 1, max: 160 }),
  body('type').optional().isIn(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  body('subtype').optional({ nullable: true }).isString().trim().isLength({ max: 80 }),
  body('active').optional().isBoolean(),
  body().custom((value) => Object.keys(value || {}).length > 0 && Object.keys(value || {}).every((key) => ['name', 'type', 'subtype', 'active'].includes(key))).withMessage('Indica al menos un campo válido para cambiar.')
];
const validateEntry = [
  body('date').isISO8601({ strict: true, strictSeparator: true }),
  body('description').isString().trim().isLength({ min: 1, max: 240 }),
  body('lines').isArray({ min: 2, max: 100 }),
  body('lines.*.accountId').isUUID(),
  body('lines.*.debit').optional().matches(/^\d{1,13}(\.\d{1,2})?$/),
  body('lines.*.credit').optional().matches(/^\d{1,13}(\.\d{1,2})?$/),
  body('lines.*.description').optional().isString().trim().isLength({ max: 240 }),
  body().custom((value) => Object.keys(value || {}).every((key) => ['date', 'description', 'lines'].includes(key))).withMessage('La solicitud contiene campos no permitidos.'),
  body('lines.*').custom((line) => Object.keys(line || {}).every((key) => ['accountId', 'debit', 'credit', 'description'].includes(key))).withMessage('Una línea contiene campos no permitidos.')
];
const validateLedgerQuery = [
  validateAccountId,
  query('from').isISO8601({ strict: true, strictSeparator: true }),
  query('to').isISO8601({ strict: true, strictSeparator: true }),
  query().custom((value) => Object.keys(value || {}).every((key) => ['from', 'to'].includes(key))).withMessage('La consulta contiene campos no permitidos.')
];

module.exports = { validateCompany, validateAccountId, validateAccount, validateAccountUpdate, validateEntry, validateLedgerQuery };
