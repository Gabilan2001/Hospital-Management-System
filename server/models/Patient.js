const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    patientId: {
      type: String,
      unique: true,
      required: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      province: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    allergies: [String],
    chronicConditions: [String],
    insuranceInfo: {
      provider: String,
      policyNumber: String,
    },
    qrCode: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    photo: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
