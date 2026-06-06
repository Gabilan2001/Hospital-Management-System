const express = require('express');
const router = express.Router();
const {
  createPrescription, getPatientPrescriptions, getPharmacyQueue,
  getPrescription, dispensePrescription,
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('doctor'), createPrescription);
router.get('/patient/:patientId', protect, getPatientPrescriptions);
router.get('/pharmacy/queue', protect, authorize('pharmacist'), getPharmacyQueue);
router.get('/:id', protect, getPrescription);
router.put('/:id/dispense', protect, authorize('pharmacist'), dispensePrescription);

module.exports = router;
