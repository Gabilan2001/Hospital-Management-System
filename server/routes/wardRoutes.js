const express = require('express');
const router = express.Router();
const {
  getWards, getBedMap, getWard, createWard, updateWard,
  addBed, updateBed, admitPatient, dischargePatient,
  getAdmissions, getPatientAdmissions,
  recordVitals, getPatientVitals, getLatestVitals,
} = require('../controllers/wardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, getWards);
router.get('/bed-map', protect, getBedMap);
router.get('/admissions', protect, getAdmissions);
router.get('/admissions/:patientId', protect, getPatientAdmissions);
router.get('/:id', protect, getWard);
router.post('/', protect, authorize('admin'), createWard);
router.put('/:id', protect, authorize('admin'), updateWard);
router.post('/beds', protect, authorize('admin'), addBed);
router.put('/beds/:id', protect, authorize('admin'), updateBed);
router.post('/admit', protect, authorize('doctor', 'admin'), admitPatient);
router.put('/admit/:id/discharge', protect, authorize('doctor', 'admin'), dischargePatient);

module.exports = router;
