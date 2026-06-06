const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
    },
    description: String,
    category: String,
    price: {
      type: Number,
      required: true,
    },
    turnaroundTime: {
      type: Number,
      default: 24,
    },
    normalRange: String,
    unit: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabTest', labTestSchema);
