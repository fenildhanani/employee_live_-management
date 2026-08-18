const express = require('express');
const router = express.Router();
const { getAttendance, clockIn, clockOut, updateAttendanceRecord } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getAttendance);
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.put('/:id', authorizeRoles('hr_admin'), updateAttendanceRecord);

module.exports = router;
