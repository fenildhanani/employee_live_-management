const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', authorizeRoles('hr_admin'), createDepartment);
router.put('/:id', authorizeRoles('hr_admin'), updateDepartment);
router.delete('/:id', authorizeRoles('hr_admin'), deleteDepartment);

module.exports = router;
