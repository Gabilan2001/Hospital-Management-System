const Ward = require('../models/Ward');
const Bed = require('../models/Bed');
const Admission = require('../models/Admission');
const VitalSign = require('../models/VitalSign');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { emitNotification } = require('../socket/socketHandler');

const updateWardBedCounts = async (wardId) => {
  const totalBeds = await Bed.countDocuments({ ward: wardId });
  const availableBeds = await Bed.countDocuments({ ward: wardId, status: 'available' });
  await Ward.findByIdAndUpdate(wardId, { totalBeds, availableBeds });
};

const getWards = async (req, res) => {
  try {
    const wards = await Ward.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, count: wards.length, data: wards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBedMap = async (req, res) => {
  try {
    const wards = await Ward.find({ isActive: true });
    const bedMap = await Promise.all(
      wards.map(async (ward) => {
        const beds = await Bed.find({ ward: ward._id }).sort({ bedNumber: 1 });
        return { ward, beds };
      })
    );
    res.status(200).json({ success: true, data: bedMap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWard = async (req, res) => {
  try {
    const ward = await Ward.findById(req.params.id);
    if (!ward) {
      return res.status(404).json({ success: false, message: 'Ward not found' });
    }

    const beds = await Bed.find({ ward: ward._id }).sort({ bedNumber: 1 });
    res.status(200).json({ success: true, data: { ward, beds } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createWard = async (req, res) => {
  try {
    const ward = await Ward.create(req.body);
    res.status(201).json({ success: true, data: ward });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateWard = async (req, res) => {
  try {
    const ward = await Ward.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ward) {
      return res.status(404).json({ success: false, message: 'Ward not found' });
    }
    res.status(200).json({ success: true, data: ward });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addBed = async (req, res) => {
  try {
    const bed = await Bed.create(req.body);
    await updateWardBedCounts(bed.ward);
    res.status(201).json({ success: true, data: bed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBed = async (req, res) => {
  try {
    const bed = await Bed.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }
    await updateWardBedCounts(bed.ward);
    res.status(200).json({ success: true, data: bed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const admitPatient = async (req, res) => {
  try {
    const { patient, doctor, bed, ward, admissionReason, diagnosis } = req.body;

    const bedDoc = await Bed.findById(bed);
    if (!bedDoc || bedDoc.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Bed is not available' });
    }

    bedDoc.status = 'occupied';
    await bedDoc.save();
    await updateWardBedCounts(ward);

    const admission = await Admission.create({
      patient,
      doctor,
      bed,
      ward,
      admissionReason,
      diagnosis,
      admittedBy: req.user._id,
    });

    const io = req.app.get('io');
    const nurses = await User.find({ role: 'nurse', isActive: true });
    for (const nurse of nurses) {
      const notif = await Notification.create({
        recipient: nurse._id,
        title: 'New Admission',
        message: 'A new patient has been admitted to the ward',
        type: 'general',
        relatedId: admission._id.toString(),
      });
      emitNotification(io, nurse._id.toString(), notif);
    }

    const populated = await Admission.findById(admission._id)
      .populate('patient', 'firstName lastName patientId')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('bed')
      .populate('ward', 'name type');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const dischargePatient = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    admission.status = 'discharged';
    admission.dischargeDate = new Date();
    admission.dischargedBy = req.user._id;
    await admission.save();

    const bed = await Bed.findById(admission.bed);
    if (bed) {
      bed.status = 'available';
      await bed.save();
      await updateWardBedCounts(admission.ward);
    }

    res.status(200).json({ success: true, data: admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdmissions = async (req, res) => {
  try {
    const filter = { status: 'admitted' };
    const admissions = await Admission.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('bed')
      .populate('ward', 'name type')
      .sort({ admissionDate: -1 });

    res.status(200).json({ success: true, count: admissions.length, data: admissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatientAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find({ patient: req.params.patientId })
      .populate('bed')
      .populate('ward', 'name')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ admissionDate: -1 });

    res.status(200).json({ success: true, data: admissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const recordVitals = async (req, res) => {
  try {
    const vitals = await VitalSign.create({
      ...req.body,
      recordedBy: req.user._id,
    });

    const populated = await VitalSign.findById(vitals._id)
      .populate('patient', 'firstName lastName patientId')
      .populate('recordedBy', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatientVitals = async (req, res) => {
  try {
    const vitals = await VitalSign.find({ patient: req.params.patientId })
      .populate('recordedBy', 'name')
      .sort({ recordedAt: -1 });

    res.status(200).json({ success: true, count: vitals.length, data: vitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLatestVitals = async (req, res) => {
  try {
    const vitals = await VitalSign.findOne({ patient: req.params.patientId })
      .populate('recordedBy', 'name')
      .sort({ recordedAt: -1 });

    res.status(200).json({ success: true, data: vitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWards, getBedMap, getWard, createWard, updateWard,
  addBed, updateBed, admitPatient, dischargePatient,
  getAdmissions, getPatientAdmissions,
  recordVitals, getPatientVitals, getLatestVitals,
};
