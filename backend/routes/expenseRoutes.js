const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, updateExpenseStatus } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/', getExpenses);
router.post('/', upload.single('receipt'), createExpense);
router.patch('/:id/status', authorizeRoles('manager', 'hr_admin'), updateExpenseStatus);

module.exports = router;
