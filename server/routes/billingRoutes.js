const express = require('express');
const router = express.Router();
const {
  generateInvoice, getInvoices, getPatientInvoices, getInvoice,
  updateInvoice, cancelInvoice, recordPayment, getPayments,
} = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/invoice', protect, authorize('billing', 'admin'), generateInvoice);
router.get('/invoices', protect, authorize('billing', 'admin'), getInvoices);
router.get('/invoices/patient/:patientId', protect, getPatientInvoices);
router.get('/invoices/:id', protect, getInvoice);
router.put('/invoices/:id', protect, authorize('billing', 'admin'), updateInvoice);
router.put('/invoices/:id/cancel', protect, authorize('admin'), cancelInvoice);
router.post('/payment', protect, authorize('billing'), recordPayment);
router.get('/payments', protect, authorize('billing', 'admin'), getPayments);

module.exports = router;
