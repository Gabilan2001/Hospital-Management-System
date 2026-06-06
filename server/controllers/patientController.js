const Patient = require('../models/Patient');
const User = require('../models/User');
const generatePatientId = require('../utils/generatePatientId');
const generateQRCode = require('../utils/generateQRCode');
const sendEmail = require('../utils/sendEmail');

const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ isActive: true })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('user', 'name email phone');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatientQR = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.status(200).json({ success: true, data: { qrCode: patient.qrCode, patientId: patient.patientId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const registerPatient = async (req, res) => {
  try {
    const {
      firstName, lastName, dateOfBirth, gender, bloodGroup,
      phone, email, address, emergencyContact, allergies,
      chronicConditions, insuranceInfo, password,
    } = req.body;

    const patientId = await generatePatientId();
    const qrCode = await generateQRCode(patientId);

    let user = null;
    if (email && password) {
      user = await User.create({
        name: `${firstName} ${lastName}`,
        email,
        password,
        role: 'patient',
        phone,
      });
    }

    const patient = await Patient.create({
      user: user?._id,
      patientId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodGroup,
      phone,
      email,
      address,
      emergencyContact,
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      insuranceInfo,
      qrCode,
    });

    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: 'Welcome to CareLink Hospital',
          html: `<h2>Welcome to CareLink Hospital</h2>
            <p>Your Patient ID: <strong>${patientId}</strong></p>
            <p>Please keep this ID for all hospital visits.</p>
            <img src="${qrCode}" alt="Patient QR Code" />`,
        });
      } catch (emailErr) {
        console.log('Email send failed:', emailErr.message);
      }
    }

    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const searchPatients = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }

    const patients = await Patient.find({
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { patientId: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ],
      isActive: true,
    }).limit(20);

    res.status(200).json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPatients, getPatient, getPatientQR, registerPatient, updatePatient, searchPatients,
};
