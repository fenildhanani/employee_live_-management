const express = require('express');
const router = express.Router();
const { getLeaveReport, getExpenseReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorizeRoles('hr_admin', 'manager'));

router.get('/leaves', getLeaveReport);
router.get('/expenses', getExpenseReport);

module.exports = router;
