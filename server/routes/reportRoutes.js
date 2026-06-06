const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getRevenueReport, getAppointmentReport,
  getDoctorReport, getBedOccupancyReport, getPatientReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/dashboard', protect, authorize('admin', 'billing'), getDashboardStats);
router.get('/revenue', protect, authorize('admin', 'billing'), getRevenueReport);
router.get('/appointments', protect, authorize('admin', 'billing'), getAppointmentReport);
router.get('/doctors', protect, authorize('admin', 'billing'), getDoctorReport);
router.get('/bed-occupancy', protect, authorize('admin', 'billing'), getBedOccupancyReport);
router.get('/patients', protect, authorize('admin', 'billing'), getPatientReport);

module.exports = router;
