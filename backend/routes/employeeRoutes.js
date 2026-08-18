const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', authorizeRoles('hr_admin', 'manager'), getEmployees);
router.get('/:id', authorizeRoles('hr_admin', 'manager', 'employee'), getEmployeeById);
router.post('/', authorizeRoles('hr_admin'), createEmployee);
router.put('/:id', authorizeRoles('hr_admin'), updateEmployee);
router.patch('/:id/status', authorizeRoles('hr_admin'), updateEmployeeStatus);
router.delete('/:id', authorizeRoles('hr_admin'), deleteEmployee);

module.exports = router;
