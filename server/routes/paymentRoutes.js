const express = require('express');
const router = express.Router();
const { initiatePayment, payhereNotify, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/initiate', protect, authorize('patient'), initiatePayment);
router.post('/notify', payhereNotify);
router.get('/verify/:orderId', protect, authorize('patient'), verifyPayment);

module.exports = router;
