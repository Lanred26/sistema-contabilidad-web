const db = require('../config/database');
async function record({ id, userId, companyId, action, resourceType, resourceId, requestId }) {
  await db.execute(`INSERT INTO audit_events (id, user_id, company_id, action, resource_type, resource_id, request_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, userId, companyId, action, resourceType, resourceId || null, requestId]);
}
module.exports = { record };
