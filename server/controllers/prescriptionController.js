const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { emitNotification } = require('../socket/socketHandler');

const createPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.create(req.body);
    const populated = await Prescription.findById(prescription._id)
      .populate('patient', 'firstName lastName patientId')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('medicines.medicine');

    const io = req.app.get('io');
    const pharmacists = await User.find({ role: 'pharmacist', isActive: true });
    for (const pharm of pharmacists) {
      const notif = await Notification.create({
        recipient: pharm._id,
        title: 'New Prescription',
        message: `New prescription for ${populated.patient.firstName} ${populated.patient.lastName}`,
        type: 'prescription',
        relatedId: prescription._id.toString(),
      });
      emitNotification(io, pharm._id.toString(), notif);
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.params.patientId })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('medicines.medicine')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPharmacyQueue = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ status: 'pending' })
      .populate('patient', 'firstName lastName patientId phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('medicines.medicine')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('medicines.medicine');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const dispensePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      {
        status: 'dispensed',
        dispensedAt: new Date(),
        dispensedBy: req.user._id,
      },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPrescription, getPatientPrescriptions, getPharmacyQueue,
  getPrescription, dispensePrescription,
};
