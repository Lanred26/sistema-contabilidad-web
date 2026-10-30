const db = require('../config/database');

async function create({ id, companyId, userId, date, description, lines }) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [accounts] = await connection.execute(`SELECT id FROM accounts WHERE company_id = ? AND active = TRUE
      AND id IN (${lines.map(() => '?').join(',')}) FOR UPDATE`, [companyId, ...lines.map((line) => line.accountId)]);
    if (accounts.length !== new Set(lines.map((line) => line.accountId)).size) {
      const err = new Error('Una o más cuentas no están activas o no pertenecen a la empresa.'); err.code = 'INVALID_ACCOUNTS'; throw err;
    }
    await connection.execute('INSERT INTO journal_entries (id, company_id, user_id, entry_date, description) VALUES (?, ?, ?, ?, ?)', [id, companyId, userId, date, description]);
    for (const line of lines) {
      await connection.execute('INSERT INTO journal_lines (id, entry_id, company_id, account_id, debit, credit, description) VALUES (UUID(), ?, ?, ?, ?, ?, ?)', [id, companyId, line.accountId, line.debit, line.credit, line.description || null]);
    }
    await connection.commit();
    return { id, date, description, lines };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

async function ledger(companyId, accountId, from, to) {
  const [accounts] = await db.execute('SELECT id, code, name, type FROM accounts WHERE id = ? AND company_id = ?', [accountId, companyId]);
  if (!accounts[0]) return null;
  const [rows] = await db.execute(`SELECT e.id AS entry_id, e.entry_date, e.description AS entry_description, l.debit, l.credit, l.description
    FROM journal_lines l JOIN journal_entries e ON e.id = l.entry_id
    WHERE e.company_id = ? AND l.account_id = ? AND e.entry_date BETWEEN ? AND ?
    ORDER BY e.entry_date, e.created_at, e.id, l.id`, [companyId, accountId, from, to]);
  const [opening] = await db.execute(`SELECT COALESCE(SUM(l.debit), 0.00) AS debit, COALESCE(SUM(l.credit), 0.00) AS credit
    FROM journal_lines l JOIN journal_entries e ON e.id = l.entry_id
    WHERE e.company_id = ? AND l.account_id = ? AND e.entry_date < ?`, [companyId, accountId, from]);
  return { account: accounts[0], from, to, opening, movements: rows };
}
module.exports = { create, ledger };
