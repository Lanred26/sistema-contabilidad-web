const db = require('../config/database');
async function list(companyId) {
  const [rows] = await db.execute('SELECT id, code, name, type, subtype, active, created_at, updated_at FROM accounts WHERE company_id = ? ORDER BY code', [companyId]);
  return rows;
}
async function find(companyId, id) {
  const [rows] = await db.execute('SELECT id, code, name, type, subtype, active FROM accounts WHERE company_id = ? AND id = ?', [companyId, id]);
  return rows[0] || null;
}
async function create({ id, companyId, code, name, type, subtype }) {
  await db.execute('INSERT INTO accounts (id, company_id, code, name, type, subtype) VALUES (?, ?, ?, ?, ?, ?)', [id, companyId, code, name, type, subtype || null]);
  return find(companyId, id);
}
async function update(companyId, id, fields) {
  await db.execute('UPDATE accounts SET name = ?, type = ?, subtype = ?, active = ? WHERE company_id = ? AND id = ?', [fields.name, fields.type, fields.subtype || null, fields.active, companyId, id]);
  return find(companyId, id);
}
async function hasMovements(companyId, id) {
  const [rows] = await db.execute(`SELECT 1 FROM journal_lines l JOIN journal_entries e ON e.id = l.entry_id
    WHERE e.company_id = ? AND l.account_id = ? LIMIT 1`, [companyId, id]);
  return rows.length > 0;
}
module.exports = { list, find, create, update, hasMovements };
