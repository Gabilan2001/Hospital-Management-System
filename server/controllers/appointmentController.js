const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Queue = require('../models/Queue');
const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const sendWhatsApp = require('../utils/sendWhatsApp');
const { emitNotification, emitQueueUpdate } = require('../socket/socketHandler');

const getColomboDayRange = (dateStr) => {
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const bookAppointment = async (req, res) => {
  try {
    const { patient, doctor, department, date, timeSlot, type, symptoms } = req.body;

    const { start, end } = getColomboDayRange(date);

    const existing = await Appointment.findOne({
      doctor,
      date: { $gte: start, $lte: end },
      timeSlot,
      status: { $nin: ['cancelled'] },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Time slot already booked' });
    }

    const dayCount = await Appointment.countDocuments({
      doctor,
      date: { $gte: start, $lte: end },
    });

    const appointmentNumber = `A-${String(dayCount + 1).padStart(3, '0')}`;

    const appointment = await Appointment.create({
      patient,
      doctor,
      department,
      date: new Date(date),
      timeSlot,
      appointmentNumber,
      type: type || 'walk-in',
      symptoms,
      queueNumber: dayCount + 1,
    });

    await Queue.create({
      doctor,
      date: new Date(date),
      patient,
      appointment: appointment._id,
      queueNumber: dayCount + 1,
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName phone email patientId')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('department', 'name');

    const io = req.app.get('io');

    const receptionists = await User.find({ role: 'receptionist', isActive: true });
    for (const rec of receptionists) {
      const notif = await Notification.create({
        recipient: rec._id,
        title: 'New Appointment',
        message: `New appointment booked for ${populated.patient.firstName} ${populated.patient.lastName}`,
        type: 'appointment',
        relatedId: appointment._id.toString(),
      });
      emitNotification(io, rec._id.toString(), notif);
    }

    const patientData = populated.patient;
    const doctorName = populated.doctor?.user?.name || 'Doctor';
    const deptName = populated.department?.name || '';

    const formatDate = (d) => {
      const dt = new Date(d);
      return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
    };

    const whatsappMsg = `🏥 CareLink Hospital\n✅ Appointment Confirmed!\n👨‍⚕️ Doctor: Dr. ${doctorName}\n📅 Date: ${formatDate(date)}\n⏰ Time: ${timeSlot}\n🔢 Queue No: ${dayCount + 1}\n📍 Department: ${deptName}\nPlease arrive 10 mins early.`;

    try {
      if (patientData.email) {
        await sendEmail({
          to: patientData.email,
          subject: 'Appointment Confirmed - CareLink Hospital',
          html: `<h2>Appointment Confirmed</h2><p>${whatsappMsg.replace(/\n/g, '<br>')}</p>`,
        });
      }
      if (patientData.phone) {
        await sendWhatsApp(patientData.phone, whatsappMsg);
      }
    } catch (notifyErr) {
      console.log('Notification failed:', notifyErr.message);
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.doctor) filter.doctor = req.query.doctor;
    if (req.query.patient) filter.patient = req.query.patient;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) {
      const { start, end } = getColomboDayRange(req.query.date);
      filter.date = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'firstName lastName patientId phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('department', 'name')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const appointments = await Appointment.find({ patient: patient._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('department', 'name')
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctorToday = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const today = new Date();
    const { start, end } = getColomboDayRange(today);

    const appointments = await Appointment.find({
      doctor: doctor._id,
      date: { $gte: start, $lte: end },
    })
      .populate('patient', 'firstName lastName patientId phone allergies')
      .sort({ timeSlot: 1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctorUpcoming = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      doctor: doctor._id,
      date: { $gte: today },
      status: { $nin: ['cancelled', 'completed'] },
    })
      .populate('patient', 'firstName lastName patientId')
      .populate('department', 'name')
      .sort({ date: 1 })
      .limit(20);

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
      .populate('department', 'name');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed' },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = { status };
    if (notes) update.notes = notes;

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rescheduleAppointment = async (req, res) => {
  try {
    const { date, timeSlot } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { date: new Date(date), timeSlot, status: 'scheduled' },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  bookAppointment, getAppointments, getMyAppointments, getDoctorToday,
  getDoctorUpcoming, getAppointment, confirmAppointment, updateAppointmentStatus,
  cancelAppointment, rescheduleAppointment,
};
