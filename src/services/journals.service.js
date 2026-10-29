const crypto = require('node:crypto');
const repo = require('../repositories/journals.repository');
const { AppError } = require('../utils/errors');
function cents(value = '0') {
  const [whole, fraction = ''] = String(value).split('.');
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
}
function decimal(centsValue) {
  const negative = centsValue < 0n;
  const absolute = negative ? -centsValue : centsValue;
  return `${negative ? '-' : ''}${absolute / 100n}.${String(absolute % 100n).padStart(2, '0')}`;
}
async function create(companyId, userId, input) {
  let debit = 0n; let credit = 0n;
  for (const [index, line] of input.lines.entries()) {
    const d = cents(line.debit); const c = cents(line.credit);
    if ((d > 0n) === (c > 0n)) throw new AppError(422, 'INVALID_LINE_AMOUNT', `La línea ${index + 1} debe tener exactamente un cargo o un abono positivo.`);
    debit += d; credit += c;
  }
  if (debit !== credit) throw new AppError(422, 'UNBALANCED_ENTRY', 'La suma del debe debe ser igual a la suma del haber.');
  try { return await repo.create({ id: crypto.randomUUID(), companyId, userId, date: input.date, description: input.description, lines: input.lines }); }
  catch (error) {
    if (error.code === 'INVALID_ACCOUNTS') throw new AppError(422, 'INVALID_ACCOUNTS', error.message);
    throw error;
  }
}
async function ledger(companyId, accountId, from, to) {
  const result = await repo.ledger(companyId, accountId, from, to);
  if (!result) throw new AppError(404, 'ACCOUNT_NOT_FOUND', 'No se encontró la cuenta.');
  const debitNormal = ['ASSET', 'EXPENSE'].includes(result.account.type);
  const balance = (debit, credit) => debitNormal ? cents(debit) - cents(credit) : cents(credit) - cents(debit);
  let running = balance(result.opening.debit, result.opening.credit);
  const movements = result.movements.map((movement) => {
    running += balance(movement.debit, movement.credit);
    return { ...movement, balance: decimal(running) };
  });
  result.openingBalance = decimal(balance(result.opening.debit, result.opening.credit));
  result.closingBalance = decimal(running);
  result.movements = movements;
  delete result.opening;
  return result;
}
module.exports = { create, ledger };
