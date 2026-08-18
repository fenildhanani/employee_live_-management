const { createCheckoutSession, handleWebhookEvent } = require('../services/stripeService');
const Company = require('../models/Company');
const Subscription = require('../models/Subscription');

const createSubscriptionCheckout = async (req, res, next) => {
  try {
    const { planName } = req.body;
    const successUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/subscription/success`;
    const cancelUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/subscription`;

    const result = await createCheckoutSession(req.user.company._id, planName, successUrl, cancelUrl);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getSubscriptionStatus = async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.company._id);
    const subscription = await Subscription.findOne({ company: req.user.company._id });

    res.status(200).json({
      success: true,
      data: {
        plan: company ? company.subscriptionPlan : 'Free',
        status: company ? company.subscriptionStatus : 'active',
        stripeCustomerId: subscription ? subscription.stripeCustomerId : null,
        stripeSubscriptionId: subscription ? subscription.stripeSubscriptionId : null
      }
    });
  } catch (error) {
    next(error);
  }
};

const handleStripeWebhook = async (req, res, next) => {
  try {
    const event = req.body;
    await handleWebhookEvent(event);
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubscriptionCheckout,
  getSubscriptionStatus,
  handleStripeWebhook
};
