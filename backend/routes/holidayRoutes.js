const express = require('express');
const router = express.Router();
const { getHolidays, createHoliday, updateHoliday, deleteHoliday } = require('../controllers/holidayController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getHolidays);
router.post('/', authorizeRoles('hr_admin'), createHoliday);
router.put('/:id', authorizeRoles('hr_admin'), updateHoliday);
router.delete('/:id', authorizeRoles('hr_admin'), deleteHoliday);

module.exports = router;
