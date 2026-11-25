const repository = require('../repositories/audit.repository');
async function record(event) { await repository.record(event); }
module.exports = { record };
