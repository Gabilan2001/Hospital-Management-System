const Medicine = require('../models/Medicine');
const PharmacyDispense = require('../models/PharmacyDispense');
const Prescription = require('../models/Prescription');
const sendWhatsApp = require('../utils/sendWhatsApp');

const getMedicines = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { genericName: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.lowStock === 'true') {
      filter.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    }

    const medicines = await Medicine.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    res.status(200).json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const dispenseMedicine = async (req, res) => {
  try {
    const { prescription, patient, items } = req.body;

    let totalAmount = 0;
    const dispenseItems = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) {
        return res.status(404).json({ success: false, message: `Medicine not found: ${item.medicine}` });
      }
      if (medicine.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicine.name}. Available: ${medicine.stock}`,
        });
      }

      const itemTotal = medicine.price * item.quantity;
      totalAmount += itemTotal;
      dispenseItems.push({
        medicine: medicine._id,
        quantity: item.quantity,
        price: medicine.price,
        total: itemTotal,
      });

      medicine.stock -= item.quantity;
      await medicine.save();

      if (medicine.stock <= medicine.lowStockThreshold) {
        try {
          await sendWhatsApp(
            process.env.OWNER_WHATSAPP,
            `🏥 CareLink Hospital\n⚠️ Low Stock Alert\nMedicine: ${medicine.name}\nStock: ${medicine.stock}`
          );
        } catch (err) {
          console.log('Low stock alert failed:', err.message);
        }
      }
    }

    const dispense = await PharmacyDispense.create({
      prescription,
      patient,
      dispensedBy: req.user._id,
      items: dispenseItems,
      totalAmount,
    });

    if (prescription) {
      await Prescription.findByIdAndUpdate(prescription, {
        status: 'dispensed',
        dispensedAt: new Date(),
        dispensedBy: req.user._id,
      });
    }

    res.status(201).json({ success: true, data: dispense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDispenseHistory = async (req, res) => {
  try {
    const history = await PharmacyDispense.find()
      .populate('patient', 'firstName lastName patientId')
      .populate('dispensedBy', 'name')
      .populate('items.medicine', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLowStock = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    }).sort({ stock: 1 });

    res.status(200).json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getExpiringMedicines = async (req, res) => {
  try {
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);

    const medicines = await Medicine.find({
      isActive: true,
      expiryDate: { $lte: thirtyDays, $gte: new Date() },
    }).sort({ expiryDate: 1 });

    res.status(200).json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMedicines, addMedicine, updateMedicine, dispenseMedicine,
  getDispenseHistory, getLowStock, getExpiringMedicines,
};
