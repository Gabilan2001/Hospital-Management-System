const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const Patient = require('../models/Patient');

const uploadToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    cloudinary.uploader.upload(
      dataUri,
      { folder, resource_type: 'image', transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const folder = req.body.folder || 'carelink/avatars';
    const result = await uploadToCloudinary(req.file, folder);

    res.status(200).json({
      success: true,
      data: { url: result.secure_url, publicId: result.public_id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const userId = req.params.userId || req.user._id;

    if (req.user.role !== 'admin' && userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const user = await User.findByIdAndUpdate(userId, { avatar }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadAndSetUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const userId = req.params.userId || req.user._id;
    if (req.user.role !== 'admin' && userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const folder = req.body.type === 'doctor' ? 'carelink/doctors' : 'carelink/patients';
    const result = await uploadToCloudinary(req.file, folder);

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: { user, url: result.secure_url } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadPatientPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const { patientId } = req.params;
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    if (req.user.role === 'patient') {
      const ownPatient = await Patient.findOne({ user: req.user._id });
      if (!ownPatient || ownPatient._id.toString() !== patientId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    const result = await uploadToCloudinary(req.file, 'carelink/patients');

    const updated = await Patient.findByIdAndUpdate(
      patientId,
      { photo: result.secure_url },
      { new: true }
    );

    if (updated.user) {
      await User.findByIdAndUpdate(updated.user, { avatar: result.secure_url });
    }

    res.status(200).json({ success: true, data: { patient: updated, url: result.secure_url } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadAvatar,
  updateUserAvatar,
  uploadAndSetUserAvatar,
  uploadPatientPhoto,
};
