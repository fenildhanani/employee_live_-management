const mongoose = require('mongoose');

const leaveApprovalSchema = new mongoose.Schema(
  {
    leaveRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveRequest', required: true },
    approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['approved', 'rejected', 'cancelled'], required: true },
    comment: { type: String, default: '' },
    actionDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeaveApproval', leaveApprovalSchema);
