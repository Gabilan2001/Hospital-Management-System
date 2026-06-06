const express = require('express');
const router = express.Router();
const {
  getLabTests, orderLabTests, getLabOrders, getPatientLabHistory, getPendingOrders,
  getLabOrder, collectSample, uploadResults, completeLabOrder,
} = require('../controllers/labController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/tests', protect, authorize('doctor', 'lab_technician', 'admin'), getLabTests);
router.post('/order', protect, authorize('doctor'), orderLabTests);
router.get('/orders', protect, authorize('doctor', 'lab_technician', 'admin'), getLabOrders);
router.get('/patient/:patientId', protect, getPatientLabHistory);
router.get('/pending', protect, authorize('lab_technician'), getPendingOrders);
router.get('/:id', protect, getLabOrder);
router.put('/:id/collect', protect, authorize('lab_technician'), collectSample);
router.put('/:id/result', protect, authorize('lab_technician'), uploadResults);
router.put('/:id/complete', protect, authorize('lab_technician'), completeLabOrder);

module.exports = router;
