const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const generateDoctorId = async () => {
  const year = new Date().getFullYear();
  const prefix = `DR-${year}-`;
  const last = await Doctor.findOne({ doctorId: { $regex: `^${prefix}` } })
    .sort({ doctorId: -1 })
    .select('doctorId');
  let next = 1;
  if (last?.doctorId) {
    const num = parseInt(last.doctorId.split('-')[2], 10);
    if (!isNaN(num)) next = num + 1;
  }
  return `${prefix}${String(next).padStart(3, '0')}`;
};

const getDoctors = async (req, res) => {
  try {
    const filter = {};
    if (req.query.all !== 'true') filter.isAvailable = true;
    if (req.query.department) filter.department = req.query.department;

    let query = Doctor.find(filter)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name icon');

    if (req.query.search) {
      const users = await User.find({
        name: { $regex: req.query.search, $options: 'i' },
        role: 'doctor',
      }).select('_id');
      query = query.where('user').in(users.map((u) => u._id));
    }

    const doctors = await query.sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name description');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const appointmentDate = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[appointmentDate.getDay()];

    const daySlot = doctor.availableSlots.find((s) => s.day === dayName);
    if (!daySlot) {
      return res.status(200).json({ success: true, data: [] });
    }

    const slots = [];
    const [startH, startM] = daySlot.startTime.split(':').map(Number);
    const [endH, endM] = daySlot.endTime.split(':').map(Number);
    const duration = daySlot.slotDuration || 20;

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + duration <= end) {
      const sh = Math.floor(current / 60);
      const sm = current % 60;
      const eh = Math.floor((current + duration) / 60);
      const em = (current + duration) % 60;
      const slot = `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')} - ${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
      slots.push(slot);
      current += duration;
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const booked = await Appointment.find({
      doctor: doctor._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled'] },
    }).select('timeSlot');

    const bookedSlots = booked.map((a) => a.timeSlot);
    const available = slots.filter((s) => !bookedSlots.includes(s));

    res.status(200).json({ success: true, data: available });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createDoctor = async (req, res) => {
  try {
    const {
      name, email, password, phone, department, specialization,
      qualification, experience, licenseNumber, bio,
      availableSlots, consultationFee, avatar,
    } = req.body;

    const user = await User.create({
      name, email, password: password || 'Doctor@123', role: 'doctor', phone, avatar: avatar || '',
    });

    const doctorId = await generateDoctorId();

    const doctor = await Doctor.create({
      user: user._id,
      doctorId,
      department,
      specialization,
      qualification,
      experience,
      licenseNumber,
      bio,
      availableSlots: availableSlots || [],
      consultationFee: consultationFee || 1500,
    });

    const populated = await Doctor.findById(doctor._id)
      .populate('user', 'name email phone')
      .populate('department', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const {
      name, email, phone, password, avatar,
      department, specialization, qualification, experience,
      licenseNumber, bio, consultationFee, isAvailable,
    } = req.body;

    const userUpdate = {};
    if (name !== undefined) userUpdate.name = name;
    if (email !== undefined) userUpdate.email = email;
    if (phone !== undefined) userUpdate.phone = phone;
    if (avatar !== undefined) userUpdate.avatar = avatar;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(doctor.user, userUpdate, { runValidators: true });
    }

    if (password && req.user.role === 'admin') {
      const user = await User.findById(doctor.user).select('+password');
      user.password = password;
      await user.save();
    }

    const doctorUpdate = {};
    if (department !== undefined) doctorUpdate.department = department;
    if (specialization !== undefined) doctorUpdate.specialization = specialization;
    if (qualification !== undefined) doctorUpdate.qualification = qualification;
    if (experience !== undefined) doctorUpdate.experience = experience;
    if (licenseNumber !== undefined) doctorUpdate.licenseNumber = licenseNumber;
    if (bio !== undefined) doctorUpdate.bio = bio;
    if (consultationFee !== undefined) doctorUpdate.consultationFee = consultationFee;
    if (isAvailable !== undefined) doctorUpdate.isAvailable = isAvailable;

    const updated = await Doctor.findByIdAndUpdate(req.params.id, doctorUpdate, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'name email phone avatar')
      .populate('department', 'name');

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deactivateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    doctor.isAvailable = false;
    await doctor.save();
    await User.findByIdAndUpdate(doctor.user, { isActive: false });

    res.status(200).json({ success: true, message: 'Doctor deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    doctor.availableSlots = req.body.availableSlots || doctor.availableSlots;
    await doctor.save();

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rateDoctor = async (req, res) => {
  try {
    const { rating } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const newTotal = doctor.totalRatings + 1;
    doctor.rating = (doctor.rating * doctor.totalRatings + rating) / newTotal;
    doctor.totalRatings = newTotal;
    await doctor.save();

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDoctors, getDoctor, getAvailableSlots, createDoctor,
  updateDoctor, updateAvailability, rateDoctor, deactivateDoctor,
};
