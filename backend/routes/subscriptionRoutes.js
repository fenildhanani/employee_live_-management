const express = require('express');
const router = express.Router();
const { createSubscriptionCheckout, getSubscriptionStatus, handleStripeWebhook } = require('../controllers/subscriptionController');
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

router.use(protect);
router.use(authorizeRoles('hr_admin'));

router.post('/checkout', createSubscriptionCheckout);
router.get('/status', getSubscriptionStatus);

router.get('/audit-logs', async (req, res, next) => {
  try {
    const logs = await AuditLog.find({ company: req.user.company._id })
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
