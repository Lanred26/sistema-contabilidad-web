const { Audit } = require('../models');
async function record({ id, userId, companyId, action, resourceType, resourceId, requestId }) {
  await Audit.create({ id, user_id: userId, company_id: companyId, action, resource_type: resourceType, resource_id: resourceId || null, request_id: requestId });
}
module.exports = { record };
