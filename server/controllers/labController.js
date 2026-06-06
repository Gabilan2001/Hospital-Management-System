const LabResult = require('../models/LabResult');
const LabTest = require('../models/LabTest');
const Notification = require('../models/Notification');
const Patient = require('../models/Patient');
const sendEmail = require('../utils/sendEmail');
const sendWhatsApp = require('../utils/sendWhatsApp');
const { emitNotification } = require('../socket/socketHandler');

const checkAbnormal = (value, normalRange) => {
  if (!value || !normalRange) return false;
  const numVal = parseFloat(value);
  if (isNaN(numVal)) return false;

  const rangeMatch = normalRange.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    return numVal < low || numVal > high;
  }

  const lessMatch = normalRange.match(/<\s*([\d.]+)/);
  if (lessMatch) return numVal >= parseFloat(lessMatch[1]);

  const greaterMatch = normalRange.match(/>\s*([\d.]+)/);
  if (greaterMatch) return numVal <= parseFloat(greaterMatch[1]);

  return false;
};

const getLabTests = async (req, res) => {
  try {
    const tests = await LabTest.find({ isActive: true }).sort({ category: 1, name: 1 });
    res.status(200).json({ success: true, count: tests.length, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const orderLabTests = async (req, res) => {
  try {
    const { patient, doctor, tests, priority } = req.body;

    const testDetails = await Promise.all(
      tests.map(async (testId) => {
        const labTest = await LabTest.findById(testId);
        return {
          labTest: testId,
          name: labTest.name,
          price: labTest.price,
          status: 'pending',
        };
      })
    );

    const labResult = await LabResult.create({
      patient,
      doctor,
      tests: testDetails,
      priority: priority || 'normal',
    });

    const populated = await LabResult.findById(labResult._id)
      .populate('patient', 'firstName lastName patientId')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLabOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const orders = await LabResult.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatientLabHistory = async (req, res) => {
  try {
    const results = await LabResult.find({ patient: req.params.patientId })
      .populate('tests.labTest')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPendingOrders = async (req, res) => {
  try {
    const orders = await LabResult.find({ status: { $in: ['pending', 'processing'] } })
      .populate('patient', 'firstName lastName patientId')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ priority: -1, createdAt: 1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLabOrder = async (req, res) => {
  try {
    const order = await LabResult.findById(req.params.id)
      .populate('patient')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('tests.labTest');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Lab order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const collectSample = async (req, res) => {
  try {
    const order = await LabResult.findByIdAndUpdate(
      req.params.id,
      { sampleCollectedAt: new Date(), status: 'processing' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Lab order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadResults = async (req, res) => {
  try {
    const { results, resultFile } = req.body;

    const processedResults = results.map((r) => ({
      ...r,
      isAbnormal: checkAbnormal(r.value, r.normalRange),
    }));

    const order = await LabResult.findByIdAndUpdate(
      req.params.id,
      {
        results: processedResults,
        resultFile,
        processedBy: req.user._id,
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Lab order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const completeLabOrder = async (req, res) => {
  try {
    const order = await LabResult.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedAt: new Date(), notificationSent: true },
      { new: true }
    ).populate('patient');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Lab order not found' });
    }

    const patient = order.patient;
    const testNames = order.tests.map((t) => t.name).join(', ');
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const whatsappMsg = `🏥 CareLink Hospital\n🔬 Your lab results are ready!\nPatient: ${patient.firstName} ${patient.lastName}\nTest: ${testNames}\nPlease login to view: ${clientUrl}\nOr visit the lab counter.`;

    try {
      if (patient.email) {
        await sendEmail({
          to: patient.email,
          subject: 'Lab Results Ready - CareLink Hospital',
          html: `<h2>Lab Results Ready</h2><p>${whatsappMsg.replace(/\n/g, '<br>')}</p>`,
        });
      }
      if (patient.phone) {
        await sendWhatsApp(patient.phone, whatsappMsg);
      }
    } catch (notifyErr) {
      console.log('Lab notification failed:', notifyErr.message);
    }

    const io = req.app.get('io');
    if (patient.user) {
      const notif = await Notification.create({
        recipient: patient.user,
        title: 'Lab Results Ready',
        message: `Your lab results for ${testNames} are ready`,
        type: 'lab_result',
        relatedId: order._id.toString(),
      });
      emitNotification(io, patient.user.toString(), notif);
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLabTests, orderLabTests, getLabOrders, getPatientLabHistory, getPendingOrders,
  getLabOrder, collectSample, uploadResults, completeLabOrder,
};
