const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');

const database = process.env.TEST_DB_NAME;
if (!database) {
  test('Sprint 2 integration tests require TEST_DB_NAME', { skip: 'Set TEST_DB_NAME to an isolated database after running db:migrate.' }, () => {});
} else {
  const request = require('supertest');
  process.env.DB_NAME = database;
  const db = require('../../src/config/database');
  const app = require('../../src/app');
  let userId; let companyId; let accountA; let accountB; let cookie;

  before(async () => {
    const suffix = crypto.randomUUID();
    userId = crypto.randomUUID(); companyId = crypto.randomUUID();
    const otherUser = crypto.randomUUID(); const otherCompany = crypto.randomUUID();
    accountA = crypto.randomUUID(); accountB = crypto.randomUUID();
    const passwordHash = await bcrypt.hash('StrongTestPassword!7', 4);
    await db.execute('INSERT INTO users (id,email,password_hash,full_name) VALUES (?,?,?,?)', [userId, `sprint2-${suffix}@example.test`, passwordHash, 'Sprint 2 Tester']);
    await db.execute('INSERT INTO companies (id,name) VALUES (?,?)', [companyId, 'Empresa Sprint 2']);
    await db.execute('INSERT INTO memberships (id,user_id,company_id,role) VALUES (?,?,?,?)', [crypto.randomUUID(), userId, companyId, 'ACCOUNTANT']);
    await db.execute('INSERT INTO accounts (id,company_id,code,name,type) VALUES (?,?,?,?,?)', [accountA, companyId, '1000', 'Caja', 'ASSET']);
    await db.execute('INSERT INTO accounts (id,company_id,code,name,type) VALUES (?,?,?,?,?)', [accountB, companyId, '4000', 'Ingresos', 'REVENUE']);
    await db.execute('INSERT INTO users (id,email,password_hash,full_name) VALUES (?,?,?,?)', [otherUser, `other-${suffix}@example.test`, passwordHash, 'Otra persona']);
    await db.execute('INSERT INTO companies (id,name) VALUES (?,?)', [otherCompany, 'Otra empresa']);
    await db.execute('INSERT INTO memberships (id,user_id,company_id,role) VALUES (?,?,?,?)', [crypto.randomUUID(), otherUser, otherCompany, 'ADMIN']);
    await db.execute('INSERT INTO accounts (id,company_id,code,name,type) VALUES (?,?,?,?,?)', [crypto.randomUUID(), otherCompany, '1000', 'Caja ajena', 'ASSET']);
    const login = await request(app).post('/api/v1/auth/sessions').send({ email: `sprint2-${suffix}@example.test`, password: 'StrongTestPassword!7' }).expect(201);
    cookie = login.headers['set-cookie'][0].split(';')[0];
  });

  after(async () => { await db.end(); });

  test('HU-01 rechaza acceso anónimo, permite login y revoca sesión al cerrar', async () => {
    await request(app).get(`/api/v1/companies/${companyId}/accounts`).expect(401);
    await request(app).get(`/api/v1/companies/${companyId}/accounts`).set('Cookie', cookie).expect(200);
    await request(app).delete('/api/v1/auth/sessions/current').set('Cookie', cookie).expect(204);
    await request(app).get(`/api/v1/companies/${companyId}/accounts`).set('Cookie', cookie).expect(401);
    const [rows] = await db.execute('SELECT id,email FROM users WHERE id = ?', [userId]);
    assert.equal(rows.length, 1);
  });

  test('HU-03 valida catálogo, evita duplicados y no mezcla empresas', async () => {
    const suffix = crypto.randomUUID().slice(0, 8);
    const login = await request(app).post('/api/v1/auth/sessions').send({ email: (await db.execute('SELECT email FROM users WHERE id = ?', [userId]))[0][0].email, password: 'StrongTestPassword!7' }).expect(201);
    const currentCookie = login.headers['set-cookie'][0].split(';')[0];
    await request(app).post(`/api/v1/companies/${companyId}/accounts`).set('Cookie', currentCookie).send({ code: `S${suffix}`, name: 'Prueba', type: 'ASSET' }).expect(201);
    await request(app).post(`/api/v1/companies/${companyId}/accounts`).set('Cookie', currentCookie).send({ code: `S${suffix}`, name: 'Duplicada', type: 'ASSET' }).expect(409);
    const list = await request(app).get(`/api/v1/companies/${companyId}/accounts`).set('Cookie', currentCookie).expect(200);
    assert.ok(list.body.data.some((account) => account.id === accountA));
    await request(app).get(`/api/v1/companies/${crypto.randomUUID()}/accounts`).set('Cookie', currentCookie).expect(404);
  });

  test('HU-04 rechaza póliza descuadrada sin persistir y publica una póliza balanceada', async () => {
    const [users] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
    const login = await request(app).post('/api/v1/auth/sessions').send({ email: users[0].email, password: 'StrongTestPassword!7' }).expect(201);
    const currentCookie = login.headers['set-cookie'][0].split(';')[0];
    const body = { date: '2026-10-29', description: 'Venta de prueba', lines: [{ accountId: accountA, debit: '99.00' }, { accountId: accountB, credit: '98.99' }] };
    await request(app).post(`/api/v1/companies/${companyId}/journal-entries`).set('Cookie', currentCookie).send(body).expect(422);
    const [none] = await db.execute('SELECT id FROM journal_entries WHERE company_id = ? AND description = ?', [companyId, body.description]);
    assert.equal(none.length, 0);
    body.lines[1].credit = '99.00';
    await request(app).post(`/api/v1/companies/${companyId}/journal-entries`).set('Cookie', currentCookie).send(body).expect(201);
    const [posted] = await db.execute('SELECT e.id, SUM(l.debit) debit, SUM(l.credit) credit FROM journal_entries e JOIN journal_lines l ON l.entry_id = e.id WHERE e.company_id = ? AND e.description = ? GROUP BY e.id', [companyId, body.description]);
    assert.equal(posted.length, 1);
    assert.equal(posted[0].debit, '99.00');
    assert.equal(posted[0].credit, '99.00');
  });

  test('el mayor devuelve sólo los movimientos de la cuenta y empresa autorizadas', async () => {
    const [users] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
    const login = await request(app).post('/api/v1/auth/sessions').send({ email: users[0].email, password: 'StrongTestPassword!7' }).expect(201);
    const currentCookie = login.headers['set-cookie'][0].split(';')[0];
    const ledger = await request(app).get(`/api/v1/companies/${companyId}/accounts/${accountA}/ledger?from=2026-01-01&to=2026-12-31`).set('Cookie', currentCookie).expect(200);
    assert.equal(ledger.body.data.movements.length, 1);
    assert.equal(ledger.body.data.movements[0].debit, '99.00');
    await request(app).get(`/api/v1/companies/${companyId}/accounts/${crypto.randomUUID()}/ledger?from=2026-01-01&to=2026-12-31`).set('Cookie', currentCookie).expect(404);
  });
}
