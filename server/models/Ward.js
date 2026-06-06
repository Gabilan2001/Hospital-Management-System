const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['general', 'icu', 'emergency', 'maternity', 'pediatric', 'private', 'semi-private'],
      required: true,
    },
    floor: Number,
    totalBeds: {
      type: Number,
      default: 0,
    },
    availableBeds: {
      type: Number,
      default: 0,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ward', wardSchema);
