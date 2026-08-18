const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    year: { type: Number, required: true, default: () => new Date().getFullYear() },
    allocatedDays: { type: Number, default: 0 },
    carryForwardDays: { type: Number, default: 0 },
    compOffDays: { type: Number, default: 0 },
    usedDays: { type: Number, default: 0 },
    pendingDays: { type: Number, default: 0 },
    remainingDays: { type: Number, default: 0 }
  },
  { timestamps: true }
);

leaveBalanceSchema.pre('save', function (next) {
  this.remainingDays = (this.allocatedDays || 0) + (this.carryForwardDays || 0) + (this.compOffDays || 0) - (this.usedDays || 0);
  next();
});

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
