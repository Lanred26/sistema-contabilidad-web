const crypto = require('node:crypto');
const db = require('../helpers/database');
const auth = require('../../src/services/auth.service');
const accounts = require('../../src/services/accounts.service');
const journals = require('../../src/services/journals.service');
const journalRepo = require('../../src/repositories/journals.repository');
const authRepo = require('../../src/repositories/auth.repository');
let companyId, userId, debit, credit;
beforeAll(async () => {
  const user = await auth.createDevelopmentUser({ email: `${crypto.randomUUID()}@example.test`, password: 'OnlyForIntegration123!', name: 'Prueba ORM', companyName: 'Prueba aislada', role: 'ADMIN' });
  ({ companyId, userId } = user);
  debit = await accounts.create(companyId, { code: '100', name: 'Caja', type: 'ASSET' });
  credit = await accounts.create(companyId, { code: '400', name: 'Ingreso', type: 'REVENUE' });
});
afterAll(async () => { await db.end(); });
test('un fallo de MySQL al insertar líneas revierte también la cabecera', async () => {
  const id = crypto.randomUUID();
  await expect(journalRepo.create({ id, companyId, userId, date: '2026-01-01', description: 'Rollback', lines: [
    { accountId: debit.id, debit: '1.00' }, { accountId: credit.id, debit: '1.00', credit: '1.00' }
  ] })).rejects.toThrow();
  const [entries] = await db.execute('SELECT id FROM journal_entries WHERE id = ?', [id]);
  const [lines] = await db.execute('SELECT id FROM journal_lines WHERE entry_id = ?', [id]);
  expect(entries).toHaveLength(0); expect(lines).toHaveLength(0);
});
test('un fallo en membresía revierte el usuario y la empresa', async () => {
  const id = crypto.randomUUID(), company = crypto.randomUUID();
  await expect(authRepo.createDevelopmentUser({ userId: id, companyId: company, membershipId: null, email: `${id}@example.test`, passwordHash: 'fixture', name: 'Prueba', companyName: 'Prueba', role: 'ADMIN' })).rejects.toThrow();
  expect((await db.execute('SELECT id FROM users WHERE id = ?', [id]))[0]).toHaveLength(0);
  expect((await db.execute('SELECT id FROM companies WHERE id = ?', [company]))[0]).toHaveLength(0);
});
test('el mayor conserva centavos, saldo inicial y naturaleza acreedora', async () => {
  const post = (date, amount) => journals.create(companyId, userId, { date, description: 'Precisión', lines: [{ accountId: debit.id, debit: amount }, { accountId: credit.id, credit: amount }] });
  await post('2026-01-01', '9999999999999.99');
  await post('2026-02-01', '0.01');
  for (const account of [debit, credit]) {
    const result = await journals.ledger(companyId, account.id, '2026-02-01', '2026-02-28');
    expect(result.openingBalance).toBe('9999999999999.99');
    expect(result.closingBalance).toBe('10000000000000.00');
    expect(result.movements).toHaveLength(1);
  }
});
test('actualiza cuentas y conserva el contrato de errores por duplicidad', async () => {
  const updated = await accounts.update(companyId, debit.id, { name: 'Caja actualizada', active: false });
  expect(updated.active).toBe(false);
  await expect(accounts.create(companyId, { code: '100', name: 'Duplicada', type: 'ASSET' })).rejects.toMatchObject({ status: 409 });
});
