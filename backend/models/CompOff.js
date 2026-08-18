const mongoose = require('mongoose');

const compOffSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    earnedDays: { type: Number, default: 1 },
    expiryDate: { type: Date },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CompOff', compOffSchema);
