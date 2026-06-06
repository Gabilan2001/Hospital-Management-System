const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Bed = require('../models/Bed');
const Ward = require('../models/Ward');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');

const getColomboToday = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getDashboardStats = async (req, res) => {
  try {
    const { start, end } = getColomboToday();

    const todayAppointments = await Appointment.find({
      date: { $gte: start, $lte: end },
    });

    const completed = todayAppointments.filter((a) => a.status === 'completed').length;
    const cancelled = todayAppointments.filter((a) => a.status === 'cancelled').length;

    const todayPayments = await Payment.find({
      paymentStatus: 'completed',
      paidAt: { $gte: start, $lte: end },
    });

    const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    const totalBeds = await Bed.countDocuments();
    const occupiedBeds = await Bed.countDocuments({ status: 'occupied' });

    const newPatients = await Patient.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    res.status(200).json({
      success: true,
      data: {
        appointments: {
          total: todayAppointments.length,
          completed,
          cancelled,
        },
        revenue: todayRevenue,
        bedOccupancy: { occupied: occupiedBeds, total: totalBeds },
        newPatients,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const payments = await Payment.find({
      paymentStatus: 'completed',
      paidAt: { $gte: start, $lte: end },
    }).populate('patient', 'firstName lastName patientId');

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    const byMethod = {};
    payments.forEach((p) => {
      byMethod[p.paymentMethod] = (byMethod[p.paymentMethod] || 0) + p.amount;
    });

    res.status(200).json({
      success: true,
      data: { payments, totalRevenue, byMethod },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAppointmentReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const appointments = await Appointment.find({
      date: { $gte: start, $lte: end },
    })
      .populate('department', 'name')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    const byStatus = {};
    const byDepartment = {};

    appointments.forEach((a) => {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
      const deptName = a.department?.name || 'Unknown';
      byDepartment[deptName] = (byDepartment[deptName] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: { appointments, byStatus, byDepartment, total: appointments.length },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctorReport = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name')
      .populate('department', 'name');

    const report = await Promise.all(
      doctors.map(async (doctor) => {
        const appointmentCount = await Appointment.countDocuments({
          doctor: doctor._id,
          status: 'completed',
        });
        return {
          doctor: doctor.user?.name,
          department: doctor.department?.name,
          specialization: doctor.specialization,
          appointments: appointmentCount,
          rating: doctor.rating,
        };
      })
    );

    report.sort((a, b) => b.appointments - a.appointments);

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBedOccupancyReport = async (req, res) => {
  try {
    const wards = await Ward.find({ isActive: true });
    const report = await Promise.all(
      wards.map(async (ward) => {
        const total = await Bed.countDocuments({ ward: ward._id });
        const occupied = await Bed.countDocuments({ ward: ward._id, status: 'occupied' });
        return {
          ward: ward.name,
          type: ward.type,
          total,
          occupied,
          available: total - occupied,
          occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
        };
      })
    );

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatientReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const patients = await Patient.find(filter).sort({ createdAt: -1 });

    const byGender = {};
    patients.forEach((p) => {
      byGender[p.gender] = (byGender[p.gender] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: { patients, total: patients.length, byGender },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats, getRevenueReport, getAppointmentReport,
  getDoctorReport, getBedOccupancyReport, getPatientReport,
};
