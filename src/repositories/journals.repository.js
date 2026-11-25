const { Op, fn, col } = require('sequelize');
const crypto = require('node:crypto');
const sequelize = require('../config/database');
const { Account, Entry, Line } = require('../models');
async function create({ id, companyId, userId, date, description, lines }) {
  return sequelize.transaction(async (transaction) => {
    const ids = [...new Set(lines.map((line) => line.accountId))];
    const accounts = await Account.findAll({ where: { company_id: companyId, active: true, id: { [Op.in]: ids } }, attributes: ['id'], transaction, lock: transaction.LOCK.UPDATE });
    if (accounts.length !== ids.length) {
      const error = new Error('Una o más cuentas no están activas o no pertenecen a la empresa.');
      error.code = 'INVALID_ACCOUNTS'; throw error;
    }
    await Entry.create({ id, company_id: companyId, user_id: userId, entry_date: date, description }, { transaction });
    await Line.bulkCreate(lines.map((line) => ({ id: crypto.randomUUID(), entry_id: id, company_id: companyId, account_id: line.accountId, debit: line.debit ?? '0.00', credit: line.credit ?? '0.00', description: line.description || null })), { transaction, validate: true });
    return { id, date, description, lines };
  });
}
async function ledger(companyId, accountId, from, to) {
  const account = await Account.findOne({ where: { id: accountId, company_id: companyId }, attributes: ['id','code','name','type'], raw: true });
  if (!account) return null;
  const include = (date, attributes) => [{ model: Entry, as: 'entry', required: true, where: { company_id: companyId, entry_date: date }, attributes }];
  const rows = await Line.findAll({ where: { company_id: companyId, account_id: accountId }, include: include({ [Op.between]: [from, to] }, ['id','entry_date','description']), order: [[{ model: Entry, as: 'entry' }, 'entry_date', 'ASC'], [{ model: Entry, as: 'entry' }, 'created_at', 'ASC'], ['entry_id','ASC'], ['id','ASC']] });
  const opening = await Line.findOne({ where: { company_id: companyId, account_id: accountId }, attributes: [[fn('COALESCE', fn('SUM', col('journal_lines.debit')), 0), 'debit'], [fn('COALESCE', fn('SUM', col('journal_lines.credit')), 0), 'credit']], include: include({ [Op.lt]: from }, []), raw: true });
  const movements = rows.map((line) => ({ entry_id: line.entry_id, entry_date: line.entry.entry_date, entry_description: line.entry.description, description: line.description, debit: line.debit, credit: line.credit }));
  return { account, from, to, opening: { debit: String(opening.debit), credit: String(opening.credit) }, movements };
}
module.exports = { create, ledger };
