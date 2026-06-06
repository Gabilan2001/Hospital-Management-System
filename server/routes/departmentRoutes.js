const express = require('express');
const router = express.Router();
const {
  getDepartments, getDepartmentDoctors, createDepartment, updateDepartment, deleteDepartment,
} = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getDepartments);
router.get('/:id/doctors', getDepartmentDoctors);
router.post('/', protect, authorize('admin'), createDepartment);
router.put('/:id', protect, authorize('admin'), updateDepartment);
router.delete('/:id', protect, authorize('admin'), deleteDepartment);

module.exports = router;
