const express = require('express');
const router = express.Router();
const {
  createMedicalRecord, getPatientRecords, getMedicalRecord, updateMedicalRecord,
} = require('../controllers/medicalRecordController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('doctor'), createMedicalRecord);
router.get('/patient/:patientId', protect, authorize('doctor', 'patient', 'admin'), getPatientRecords);
router.get('/:id', protect, getMedicalRecord);
router.put('/:id', protect, authorize('doctor'), updateMedicalRecord);

module.exports = router;
