const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const generateInvoiceNumber = require('../utils/generateInvoiceNumber');

const generateInvoice = async (req, res) => {
  try {
    const { patient, admission, items, discount, discountReason, tax, dueDate, notes } = req.body;

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = subtotal - (discount || 0) + (tax || 0);
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      patient,
      admission,
      items,
      subtotal,
      discount: discount || 0,
      discountReason,
      tax: tax || 0,
      totalAmount,
      dueDate,
      notes,
      generatedBy: req.user._id,
    });

    const populated = await Invoice.findById(invoice._id)
      .populate('patient', 'firstName lastName patientId phone email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInvoices = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.patient) filter.patient = req.query.patient;

    const invoices = await Invoice.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .populate('generatedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatientInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ patient: req.params.patientId })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient')
      .populate('generatedBy', 'name');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const recordPayment = async (req, res) => {
  try {
    const { invoice, patient, amount, paymentMethod, notes } = req.body;

    const payment = await Payment.create({
      invoice,
      patient,
      amount,
      paymentMethod,
      paymentStatus: 'completed',
      receivedBy: req.user._id,
      paidAt: new Date(),
      notes,
    });

    const invoiceDoc = await Invoice.findById(invoice);
    const totalPaid = await Payment.aggregate([
      { $match: { invoice: invoiceDoc._id, paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const paidAmount = totalPaid[0]?.total || 0;
    if (paidAmount >= invoiceDoc.totalAmount) {
      invoiceDoc.status = 'paid';
    } else if (paidAmount > 0) {
      invoiceDoc.status = 'partial';
    }
    await invoiceDoc.save();

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('invoice', 'invoiceNumber totalAmount')
      .populate('patient', 'firstName lastName patientId')
      .populate('receivedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateInvoice, getInvoices, getPatientInvoices, getInvoice,
  updateInvoice, cancelInvoice, recordPayment, getPayments,
};
