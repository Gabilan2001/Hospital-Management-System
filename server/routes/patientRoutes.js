const express = require('express');
const router = express.Router();
const {
  getPatients, getPatient, getPatientQR, registerPatient, updatePatient, searchPatients,
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/search', protect, searchPatients);
router.get('/', protect, authorize('admin', 'receptionist', 'doctor'), getPatients);
router.get('/:id', protect, getPatient);
router.get('/:id/qr', protect, getPatientQR);
router.post('/', protect, authorize('admin', 'receptionist', 'patient'), registerPatient);
router.put('/:id', protect, authorize('admin', 'receptionist', 'doctor'), updatePatient);

module.exports = router;
