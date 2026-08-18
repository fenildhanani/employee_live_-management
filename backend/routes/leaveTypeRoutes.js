const express = require('express');
const router = express.Router();
const {
  getLeaveTypes,
  getLeaveTypeById,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType
} = require('../controllers/leaveTypeController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getLeaveTypes);
router.get('/:id', getLeaveTypeById);
router.post('/', authorizeRoles('hr_admin'), createLeaveType);
router.put('/:id', authorizeRoles('hr_admin'), updateLeaveType);
router.delete('/:id', authorizeRoles('hr_admin'), deleteLeaveType);

module.exports = router;
