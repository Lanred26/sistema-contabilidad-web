const crypto = require('node:crypto');
const repo = require('../repositories/accounts.repository');
const { AppError } = require('../utils/errors');
async function create(companyId, input) {
  try { return await repo.create({ id: crypto.randomUUID(), companyId, ...input }); }
  catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new AppError(409, 'ACCOUNT_CODE_EXISTS', 'Ya existe una cuenta con ese código en la empresa.');
    throw error;
  }
}
async function update(companyId, id, input) {
  const current = await repo.find(companyId, id);
  if (!current) throw new AppError(404, 'ACCOUNT_NOT_FOUND', 'No se encontró la cuenta.');
  if (input.active === false && await repo.hasMovements(companyId, id)) {
    input.active = false;
  }
  return repo.update(companyId, id, { ...current, ...input, active: input.active ?? current.active });
}
module.exports = { list: repo.list, create, update };
