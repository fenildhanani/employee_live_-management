const AuditLog = require('../models/AuditLog');

const logAudit = async ({ company, action, performedBy, targetEntity = '', targetId = null, details = '', ipAddress = '' }) => {
  try {
    await AuditLog.create({
      company,
      action,
      performedBy,
      targetEntity,
      targetId,
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Audit log creation failed:', error.message);
  }
};

module.exports = logAudit;
