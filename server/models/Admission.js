const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema(
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
    bed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bed',
      required: true,
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    dischargeDate: Date,
    admissionReason: String,
    diagnosis: String,
    status: {
      type: String,
      enum: ['admitted', 'discharged', 'transferred'],
      default: 'admitted',
    },
    admittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dischargedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admission', admissionSchema);
