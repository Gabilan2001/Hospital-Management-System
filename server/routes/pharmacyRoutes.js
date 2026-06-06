const express = require('express');
const router = express.Router();
const {
  getMedicines, addMedicine, updateMedicine, dispenseMedicine,
  getDispenseHistory, getLowStock, getExpiringMedicines,
} = require('../controllers/pharmacyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/medicines', protect, authorize('doctor', 'pharmacist', 'admin'), getMedicines);
router.post('/medicines', protect, authorize('pharmacist', 'admin'), addMedicine);
router.put('/medicines/:id', protect, authorize('pharmacist', 'admin'), updateMedicine);
router.post('/dispense', protect, authorize('pharmacist'), dispenseMedicine);
router.get('/dispense/history', protect, authorize('pharmacist', 'admin'), getDispenseHistory);
router.get('/low-stock', protect, authorize('pharmacist', 'admin'), getLowStock);
router.get('/expiring', protect, authorize('pharmacist', 'admin'), getExpiringMedicines);

module.exports = router;
