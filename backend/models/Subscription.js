const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    stripeCustomerId: { type: String, default: '' },
    stripeSubscriptionId: { type: String, default: '' },
    plan: { type: String, enum: ['Free', 'Basic', 'Professional', 'Enterprise'], default: 'Professional' },
    status: { type: String, enum: ['active', 'past_due', 'canceled', 'trialing'], default: 'active' },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
