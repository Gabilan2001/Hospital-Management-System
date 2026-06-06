const express = require('express');
const router = express.Router();
const {
  getDoctors, getDoctor, getAvailableSlots, createDoctor,
  updateDoctor, updateAvailability, rateDoctor,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.get('/:id/slots', getAvailableSlots);
router.post('/', protect, authorize('admin'), createDoctor);
router.put('/:id', protect, authorize('admin', 'doctor'), updateDoctor);
router.put('/:id/availability', protect, authorize('admin', 'doctor'), updateAvailability);
router.post('/:id/rate', protect, authorize('patient'), rateDoctor);

module.exports = router;
