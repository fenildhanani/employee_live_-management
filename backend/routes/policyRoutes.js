const express = require('express');
const router = express.Router();
const { getPolicies, createPolicy, updatePolicy, deletePolicy } = require('../controllers/policyController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getPolicies);
router.post('/', authorizeRoles('hr_admin'), createPolicy);
router.put('/:id', authorizeRoles('hr_admin'), updatePolicy);
router.delete('/:id', authorizeRoles('hr_admin'), deletePolicy);

module.exports = router;
