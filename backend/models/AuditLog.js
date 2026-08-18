const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetEntity: { type: String, default: '' },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: String, default: '' },
    ipAddress: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
