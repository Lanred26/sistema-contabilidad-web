const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const database = process.env.TEST_DB_NAME;
if (!database) {
  test.skip('Sprint 2 integration tests require TEST_DB_NAME', () => {});
} else {
  process.env.DB_NAME = database;
  const db = require('../../src/config/database');
  const app = require('../../src/app');
  const { hashPassword } = require('../../src/utils/contrasenas');
  let userId; let companyId; let accountA; let accountB; let cookie;
  let server; let baseUrl;

  async function send(method, path, { body, session } = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(session ? { Cookie: session } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const text = await response.text();
    return { status: response.status, headers: response.headers, body: text ? JSON.parse(text) : null };
  }

  beforeAll(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    const suffix = crypto.randomUUID();
    userId = crypto.randomUUID(); companyId = crypto.randomUUID();
    const otherUser = crypto.randomUUID(); const otherCompany = crypto.randomUUID();
    accountA = crypto.randomUUID(); accountB = crypto.randomUUID();
    const passwordHash = await hashPassword('StrongTestPassword!7');
    await db.execute('INSERT INTO users (id,email,password_hash,full_name) VALUES (?,?,?,?)', [userId, `sprint2-${suffix}@example.test`, passwordHash, 'Sprint 2 Tester']);
    await db.execute('INSERT INTO companies (id,name) VALUES (?,?)', [companyId, 'Empresa Sprint 2']);
    await db.execute('INSERT INTO memberships (id,user_id,company_id,role) VALUES (?,?,?,?)', [crypto.randomUUID(), userId, companyId, 'ACCOUNTANT']);
    await db.execute('INSERT INTO accounts (id,company_id,code,name,type) VALUES (?,?,?,?,?)', [accountA, companyId, '1000', 'Caja', 'ASSET']);
    await db.execute('INSERT INTO accounts (id,company_id,code,name,type) VALUES (?,?,?,?,?)', [accountB, companyId, '4000', 'Ingresos', 'REVENUE']);
    await db.execute('INSERT INTO users (id,email,password_hash,full_name) VALUES (?,?,?,?)', [otherUser, `other-${suffix}@example.test`, passwordHash, 'Otra persona']);
    await db.execute('INSERT INTO companies (id,name) VALUES (?,?)', [otherCompany, 'Otra empresa']);
    await db.execute('INSERT INTO memberships (id,user_id,company_id,role) VALUES (?,?,?,?)', [crypto.randomUUID(), otherUser, otherCompany, 'ADMIN']);
    await db.execute('INSERT INTO accounts (id,company_id,code,name,type) VALUES (?,?,?,?,?)', [crypto.randomUUID(), otherCompany, '1000', 'Caja ajena', 'ASSET']);
    const login = await send('POST', '/api/v1/auth/sessions', { body: { email: `sprint2-${suffix}@example.test`, password: 'StrongTestPassword!7' } });
    assert.equal(login.status, 201);
    cookie = login.headers.get('set-cookie').split(';')[0];
  });

  afterAll(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await db.end();
  });

  test('HU-01 rechaza acceso anónimo, permite login y revoca sesión al cerrar', async () => {
    assert.equal((await send('GET', `/api/v1/companies/${companyId}/accounts`)).status, 401);
    assert.equal((await send('GET', `/api/v1/companies/${companyId}/accounts`, { session: cookie })).status, 200);
    assert.equal((await send('DELETE', '/api/v1/auth/sessions/current', { session: cookie })).status, 204);
    assert.equal((await send('GET', `/api/v1/companies/${companyId}/accounts`, { session: cookie })).status, 401);
    const [rows] = await db.execute('SELECT id,email FROM users WHERE id = ?', [userId]);
    assert.equal(rows.length, 1);
  });

  test('HU-03 valida catálogo, evita duplicados y no mezcla empresas', async () => {
    const suffix = crypto.randomUUID().slice(0, 8);
    const login = await send('POST', '/api/v1/auth/sessions', { body: { email: (await db.execute('SELECT email FROM users WHERE id = ?', [userId]))[0][0].email, password: 'StrongTestPassword!7' } });
    const currentCookie = login.headers.get('set-cookie').split(';')[0];
    assert.equal((await send('POST', `/api/v1/companies/${companyId}/accounts`, { session: currentCookie, body: { code: `S${suffix}`, name: 'Prueba', type: 'ASSET' } })).status, 201);
    assert.equal((await send('POST', `/api/v1/companies/${companyId}/accounts`, { session: currentCookie, body: { code: `S${suffix}`, name: 'Duplicada', type: 'ASSET' } })).status, 409);
    const list = await send('GET', `/api/v1/companies/${companyId}/accounts`, { session: currentCookie });
    assert.equal(list.status, 200);
    assert.ok(list.body.data.some((account) => account.id === accountA));
    assert.equal((await send('GET', `/api/v1/companies/${crypto.randomUUID()}/accounts`, { session: currentCookie })).status, 404);
  });

  test('HU-04 rechaza póliza descuadrada sin persistir y publica una póliza balanceada', async () => {
    const [users] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
    const login = await send('POST', '/api/v1/auth/sessions', { body: { email: users[0].email, password: 'StrongTestPassword!7' } });
    const currentCookie = login.headers.get('set-cookie').split(';')[0];
    const body = { date: '2026-10-29', description: 'Venta de prueba', lines: [{ accountId: accountA, debit: '99.00' }, { accountId: accountB, credit: '98.99' }] };
    assert.equal((await send('POST', `/api/v1/companies/${companyId}/journal-entries`, { session: currentCookie, body })).status, 422);
    const [none] = await db.execute('SELECT id FROM journal_entries WHERE company_id = ? AND description = ?', [companyId, body.description]);
    assert.equal(none.length, 0);
    body.lines[1].credit = '99.00';
    assert.equal((await send('POST', `/api/v1/companies/${companyId}/journal-entries`, { session: currentCookie, body })).status, 201);
    const [posted] = await db.execute('SELECT e.id, SUM(l.debit) debit, SUM(l.credit) credit FROM journal_entries e JOIN journal_lines l ON l.entry_id = e.id WHERE e.company_id = ? AND e.description = ? GROUP BY e.id', [companyId, body.description]);
    assert.equal(posted.length, 1);
    assert.equal(posted[0].debit, '99.00');
    assert.equal(posted[0].credit, '99.00');
  });

  test('el mayor devuelve sólo los movimientos de la cuenta y empresa autorizadas', async () => {
    const [users] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
    const login = await send('POST', '/api/v1/auth/sessions', { body: { email: users[0].email, password: 'StrongTestPassword!7' } });
    const currentCookie = login.headers.get('set-cookie').split(';')[0];
    const ledger = await send('GET', `/api/v1/companies/${companyId}/accounts/${accountA}/ledger?from=2026-01-01&to=2026-12-31`, { session: currentCookie });
    assert.equal(ledger.status, 200);
    assert.equal(ledger.body.data.movements.length, 1);
    assert.equal(ledger.body.data.movements[0].debit, '99.00');
    assert.equal((await send('GET', `/api/v1/companies/${companyId}/accounts/${crypto.randomUUID()}/ledger?from=2026-01-01&to=2026-12-31`, { session: currentCookie })).status, 404);
  });
}
