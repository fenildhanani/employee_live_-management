const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startSession: { type: String, enum: ['Full Day', 'First Half', 'Second Half'], default: 'Full Day' },
    endSession: { type: String, enum: ['Full Day', 'First Half', 'Second Half'], default: 'Full Day' },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true, trim: true },
    attachment: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
    cancelReason: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
