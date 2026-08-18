const express = require('express');
const router = express.Router();
const { getCompOffs, applyCompOff, approveCompOff, rejectCompOff } = require('../controllers/compOffController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getCompOffs);
router.post('/', applyCompOff);
router.post('/:id/approve', authorizeRoles('manager', 'hr_admin'), approveCompOff);
router.post('/:id/reject', authorizeRoles('manager', 'hr_admin'), rejectCompOff);

module.exports = router;
