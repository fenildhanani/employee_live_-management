const mongoose = require('mongoose');

const expenseClaimSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    expenseDate: { type: Date, required: true },
    description: { type: String, default: '' },
    receipt: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExpenseClaim', expenseClaimSchema);
