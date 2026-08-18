const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, default: 'Mord Spark' },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    country: { type: String, default: 'India' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    subscriptionPlan: { type: String, enum: ['Free', 'Basic', 'Professional', 'Enterprise'], default: 'Professional' },
    subscriptionStatus: { type: String, enum: ['active', 'inactive', 'canceled', 'past_due'], default: 'active' },
    weeklyOffs: { type: [String], default: ['Saturday', 'Sunday'] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
