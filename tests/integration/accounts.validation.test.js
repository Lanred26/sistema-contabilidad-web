const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const db = require('../../src/config/database');
const app = require('../../src/app');
const { hashPassword } = require('../../src/utils/contrasenas');

let server;
let baseUrl;
let companyId;
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
  const password = 'StrongTestPassword!7';
  const passwordHash = await hashPassword(password);
  await db.execute('INSERT INTO users (id,email,password_hash,full_name) VALUES (?,?,?,?)', [userId, `accounts-${suffix}@example.test`, passwordHash, 'Accounts Test']);
  await db.execute('INSERT INTO companies (id,name) VALUES (?,?)', [companyId, 'Accounts Validation Test']);
  await db.execute('INSERT INTO memberships (id,user_id,company_id,role) VALUES (?,?,?,?)', [crypto.randomUUID(), userId, companyId, 'ACCOUNTANT']);
  const loginResponse = await fetch(`${baseUrl}/api/v1/auth/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `accounts-${suffix}@example.test`, password })
  });
  assert.equal(loginResponse.status, 201);
  cookie = loginResponse.headers.get('set-cookie').split(';')[0];
});

afterAll(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await db.end();
});

test('rechaza un tipo de cuenta no permitido y no lo guarda', async () => {
  const code = `BAD-${crypto.randomUUID().slice(0, 8)}`;
  const result = await send('POST', `/api/v1/companies/${companyId}/accounts`, {
    session: cookie,
    body: { code, name: 'Cuenta inválida', type: 'UNKNOWN' }
  });

  assert.equal(result.status, 422);
  const [rows] = await db.execute('SELECT id FROM accounts WHERE company_id = ? AND code = ?', [companyId, code]);
  assert.equal(rows.length, 0);
});
