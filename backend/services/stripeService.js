const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key');
const Company = require('../models/Company');
const Subscription = require('../models/Subscription');

const createCheckoutSession = async (companyId, planName, successUrl, cancelUrl) => {
  const company = await Company.findById(companyId);
  if (!company) throw new Error('Company not found');

  const prices = {
    Free: 0,
    Basic: 4900, // $49.00
    Professional: 9900, // $99.00
    Enterprise: 29900 // $299.00
  };

  const amount = prices[planName] || 9900;

  if (amount === 0) {
    company.subscriptionPlan = 'Free';
    company.subscriptionStatus = 'active';
    await company.save();
    return { url: `${successUrl}?plan=Free&status=active` };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `ELMS ${planName} Subscription`,
              description: `Monthly subscription for ${company.name}`
            },
            unit_amount: amount,
            recurring: { interval: 'month' }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&plan=${planName}`,
      cancel_url: cancelUrl,
      client_reference_id: company._id.toString(),
      customer_email: company.email
    });

    return { url: session.url, sessionId: session.id };
  } catch (error) {
    console.error('Stripe Checkout Creation Error:', error.message);
    company.subscriptionPlan = planName;
    company.subscriptionStatus = 'active';
    await company.save();
    return { url: `${successUrl}?plan=${planName}&status=simulated` };
  }
};

const handleWebhookEvent = async (event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const companyId = session.client_reference_id;
      if (companyId) {
        await Company.findByIdAndUpdate(companyId, {
          subscriptionStatus: 'active'
        });
        await Subscription.findOneAndUpdate(
          { company: companyId },
          {
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            status: 'active'
          },
          { upsert: true }
        );
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: sub.id },
        { status: 'canceled' }
      );
      break;
    }
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhookEvent
};
