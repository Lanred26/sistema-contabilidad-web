const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const db = require('../../src/config/database');
const app = require('../../src/app');
const { hashPassword } = require('../../src/utils/contrasenas');

let server;
let baseUrl;
let companyId;
let ownAccountId;
let foreignAccountId;
let cookie;

async function send(method, path, { body, session } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(session ? { Cookie: session } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
}

beforeAll(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  const suffix = crypto.randomUUID();
  const userId = crypto.randomUUID();
  companyId = crypto.randomUUID();
  const otherCompanyId = crypto.randomUUID();
  ownAccountId = crypto.randomUUID();
  foreignAccountId = crypto.randomUUID();
  const email = `journals-${suffix}@example.test`;
  const password = 'StrongTestPassword!7';
  const passwordHash = await hashPassword(password);
  await db.execute('INSERT INTO users (id,email,password_hash,full_name) VALUES (?,?,?,?)', [userId, email, passwordHash, 'Journal Test']);
  await db.execute('INSERT INTO companies (id,name) VALUES (?,?)', [companyId, 'Journal Test']);
  await db.execute('INSERT INTO companies (id,name) VALUES (?,?)', [otherCompanyId, 'Other Journal Test']);
  await db.execute('INSERT INTO memberships (id,user_id,company_id,role) VALUES (?,?,?,?)', [crypto.randomUUID(), userId, companyId, 'ACCOUNTANT']);
  await db.execute('INSERT INTO accounts (id,company_id,code,name,type) VALUES (?,?,?,?,?)', [ownAccountId, companyId, '1000', 'Caja propia', 'ASSET']);
  await db.execute('INSERT INTO accounts (id,company_id,code,name,type) VALUES (?,?,?,?,?)', [foreignAccountId, otherCompanyId, '4000', 'Ingreso ajeno', 'REVENUE']);
  const login = await fetch(`${baseUrl}/api/v1/auth/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  assert.equal(login.status, 201);
  cookie = login.headers.get('set-cookie').split(';')[0];
});

afterAll(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await db.end();
});

test('rechaza y no guarda una póliza con una cuenta de otra empresa', async () => {
  const description = `Póliza ajena ${crypto.randomUUID()}`;
  const result = await send('POST', `/api/v1/companies/${companyId}/journal-entries`, {
    session: cookie,
    body: {
      date: '2026-10-29',
      description,
      lines: [
        { accountId: ownAccountId, debit: '50.00' },
        { accountId: foreignAccountId, credit: '50.00' }
      ]
    }
  });

  assert.equal(result.status, 422);
  assert.equal(result.body.code, 'INVALID_ACCOUNTS');
  const [rows] = await db.execute('SELECT id FROM journal_entries WHERE company_id = ? AND description = ?', [companyId, description]);
  assert.equal(rows.length, 0);
});
