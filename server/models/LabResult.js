const mongoose = require('mongoose');

const labResultSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    tests: [
      {
        labTest: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'LabTest',
        },
        name: String,
        price: Number,
        status: {
          type: String,
          enum: ['pending', 'processing', 'completed'],
          default: 'pending',
        },
      },
    ],
    orderedAt: {
      type: Date,
      default: Date.now,
    },
    priority: {
      type: String,
      enum: ['normal', 'urgent'],
      default: 'normal',
    },
    sampleCollectedAt: Date,
    results: [
      {
        labTest: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'LabTest',
        },
        value: String,
        unit: String,
        normalRange: String,
        isAbnormal: Boolean,
        notes: String,
      },
    ],
    resultFile: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed'],
      default: 'pending',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: Date,
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabResult', labResultSchema);
