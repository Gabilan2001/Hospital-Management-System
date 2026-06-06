const mongoose = require('mongoose');

const vitalSignSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    admission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admission',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    temperature: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
    },
    pulse: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number,
    bloodGlucose: Number,
    notes: String,
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VitalSign', vitalSignSchema);
