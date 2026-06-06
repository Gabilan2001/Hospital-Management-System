const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    genericName: String,
    brand: String,
    category: String,
    barcode: {
      type: String,
      unique: true,
      sparse: true,
    },
    unit: {
      type: String,
      enum: ['tablet', 'capsule', 'ml', 'mg', 'pcs'],
      default: 'tablet',
    },
    price: {
      type: Number,
      required: true,
    },
    costPrice: Number,
    stock: {
      type: Number,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    expiryDate: Date,
    supplier: String,
    description: String,
    requiresPrescription: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
