const express = require('express');
const router = express.Router();
const {
  recordVitals, getPatientVitals, getLatestVitals,
} = require('../controllers/wardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('nurse', 'doctor'), recordVitals);
router.get('/patient/:patientId', protect, getPatientVitals);
router.get('/patient/:patientId/latest', protect, getLatestVitals);

module.exports = router;
