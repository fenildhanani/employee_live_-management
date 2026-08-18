const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    annualAllocation: { type: Number, required: true, default: 12 },
    paid: { type: Boolean, default: true },
    maxConsecutiveDays: { type: Number, default: 14 },
    minimumNoticeDays: { type: Number, default: 1 },
    carryForwardAllowed: { type: Boolean, default: false },
    maxCarryForward: { type: Number, default: 0 },
    requiresDocument: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
