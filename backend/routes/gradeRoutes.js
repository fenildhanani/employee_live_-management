const express = require('express');
const router = express.Router();
const { getGrades, createGrade, updateGrade, deleteGrade } = require('../controllers/gradeController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getGrades);
router.post('/', authorizeRoles('hr_admin'), createGrade);
router.put('/:id', authorizeRoles('hr_admin'), updateGrade);
router.delete('/:id', authorizeRoles('hr_admin'), deleteGrade);

module.exports = router;
