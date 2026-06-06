const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  uploadAvatar,
  updateUserAvatar,
  uploadAndSetUserAvatar,
  uploadPatientPhoto,
} = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/avatar', protect, upload.single('image'), uploadAvatar);
router.put('/avatar/:userId', protect, updateUserAvatar);
router.post('/avatar/user/me', protect, upload.single('image'), (req, res, next) => {
  req.params.userId = req.user._id.toString();
  next();
}, uploadAndSetUserAvatar);
router.post('/avatar/user/:userId', protect, upload.single('image'), uploadAndSetUserAvatar);
router.post('/patient/:patientId/photo', protect, authorize('admin', 'receptionist', 'patient', 'doctor'), upload.single('image'), uploadPatientPhoto);

module.exports = router;
