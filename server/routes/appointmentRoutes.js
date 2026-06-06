const express = require('express');
const router = express.Router();
const {
  bookAppointment, getAppointments, getMyAppointments, getDoctorToday,
  getDoctorUpcoming, getAppointment, confirmAppointment, updateAppointmentStatus,
  cancelAppointment, rescheduleAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('patient', 'receptionist'), bookAppointment);
router.get('/my', protect, authorize('patient'), getMyAppointments);
router.get('/doctor/today', protect, authorize('doctor'), getDoctorToday);
router.get('/doctor/upcoming', protect, authorize('doctor'), getDoctorUpcoming);
router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointment);
router.put('/:id/confirm', protect, authorize('receptionist', 'admin'), confirmAppointment);
router.put('/:id/status', protect, authorize('doctor', 'receptionist'), updateAppointmentStatus);
router.put('/:id/cancel', protect, authorize('patient', 'receptionist'), cancelAppointment);
router.put('/:id/reschedule', protect, authorize('patient', 'receptionist'), rescheduleAppointment);

module.exports = router;
