const express = require('express');
const router = express.Router();
const {
  getLeaves,
  getLeaveById,
  createLeaveRequest,
  handleApprove,
  handleReject,
  handleCancel,
  getMyLeaveBalances,
  getAllLeaveBalances
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/balances/my', getMyLeaveBalances);
router.get('/balances/all', authorizeRoles('hr_admin', 'manager'), getAllLeaveBalances);

router.get('/', getLeaves);
router.get('/:id', getLeaveById);
router.post('/', upload.single('attachment'), createLeaveRequest);

router.post('/:id/approve', authorizeRoles('manager', 'hr_admin'), handleApprove);
router.post('/:id/reject', authorizeRoles('manager', 'hr_admin'), handleReject);
router.post('/:id/cancel', handleCancel);

module.exports = router;
