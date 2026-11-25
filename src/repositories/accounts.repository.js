const { Account } = require('../models');
const fields = ['id','code','name','type','subtype','active'];
async function list(companyId) {
  const rows = await Account.findAll({ where: { company_id: companyId }, attributes: [...fields,'created_at','updated_at'], order: [['code','ASC']] });
  return rows.map((row) => row.get({ plain: true }));
}
async function find(companyId, id) {
  const row = await Account.findOne({ where: { company_id: companyId, id }, attributes: fields });
  return row ? row.get({ plain: true }) : null;
}
async function create({ id, companyId, code, name, type, subtype }) {
  await Account.create({ id, company_id: companyId, code, name, type, subtype: subtype || null });
  return find(companyId, id);
}
async function update(companyId, id, fields) {
  await Account.update({ name: fields.name, type: fields.type, subtype: fields.subtype || null, active: fields.active, updated_at: new Date() }, { where: { company_id: companyId, id } });
  return find(companyId, id);
}
module.exports = { list, find, create, update };
