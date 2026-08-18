const mongoose = require('mongoose');

const leavePolicySchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    grade: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade', default: null },
    location: { type: String, default: '' },
    allocation: { type: Number, required: true },
    maxConsecutiveDays: { type: Number, default: 14 },
    minimumNoticeDays: { type: Number, default: 1 },
    carryForwardAllowed: { type: Boolean, default: false },
    maxCarryForward: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeavePolicy', leavePolicySchema);
