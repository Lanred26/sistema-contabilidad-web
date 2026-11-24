const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { User, Company, Membership, Session } = require('../models');
async function findUserByEmail(email) {
  return User.findOne({ where: { email }, attributes: ['id','email','password_hash','full_name','active'], raw: true });
}
async function createSession({ id, userId, tokenHash, expiresAt }) {
  await Session.create({ id, user_id: userId, token_hash: tokenHash, expires_at: expiresAt });
}
async function findSession(tokenHash) {
  const session = await Session.findOne({ where: { token_hash: tokenHash, revoked_at: null, expires_at: { [Op.gt]: new Date() } }, include: [{ model: User, as: 'user', required: true, where: { active: true }, attributes: ['id','email','full_name'] }] });
  if (!session) return null;
  return { session_id: session.id, id: session.user.id, email: session.user.email, full_name: session.user.full_name };
}
async function revokeSession(tokenHash) {
  await Session.update({ revoked_at: new Date() }, { where: { token_hash: tokenHash, revoked_at: null } });
}
async function memberships(userId) {
  return Membership.findAll({ where: { user_id: userId, active: true }, attributes: ['company_id','role'], include: [{ model: Company, as: 'company', required: true, attributes: [] }], raw: true });
}
async function findMembership(userId, companyId) {
  return Membership.findOne({ where: { user_id: userId, company_id: companyId, active: true }, attributes: ['role'], raw: true });
}
async function createDevelopmentUser({ userId, companyId, membershipId, email, passwordHash, name, companyName, role }) {
  await sequelize.transaction(async (transaction) => {
    await User.create({ id: userId, email, password_hash: passwordHash, full_name: name }, { transaction });
    await Company.create({ id: companyId, name: companyName }, { transaction });
    await Membership.create({ id: membershipId, user_id: userId, company_id: companyId, role }, { transaction });
  });
  return { userId, companyId };
}
module.exports = { findUserByEmail, createSession, findSession, revokeSession, memberships, findMembership, createDevelopmentUser };
