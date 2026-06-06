const express = require('express');
const router = express.Router();
const {
  getQueueDisplay, getDoctorQueue, addToQueue,
  callNextPatient, completeQueue, skipPatient,
} = require('../controllers/queueController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/display', getQueueDisplay);
router.get('/doctor/:doctorId', protect, authorize('receptionist', 'doctor'), getDoctorQueue);
router.post('/', protect, authorize('receptionist'), addToQueue);
router.put('/:id/call', protect, authorize('receptionist', 'doctor'), callNextPatient);
router.put('/:id/complete', protect, authorize('doctor'), completeQueue);
router.put('/:id/skip', protect, authorize('receptionist'), skipPatient);

module.exports = router;
