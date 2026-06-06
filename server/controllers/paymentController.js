const { v4: uuidv4 } = require('uuid');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Patient = require('../models/Patient');
const { generatePayHereHash, verifyPayHereHash } = require('../utils/payhereHash');

const initiatePayment = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findById(invoiceId).populate('patient');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Invoice already paid' });
    }

    const orderId = `CLH-${uuidv4().slice(0, 8).toUpperCase()}`;
    const amount = invoice.totalAmount.toFixed(2);
    const currency = 'LKR';

    const hash = generatePayHereHash({
      merchantId: process.env.PAYHERE_MERCHANT_ID,
      orderId,
      amount,
      currency,
      merchantSecret: process.env.PAYHERE_MERCHANT_SECRET,
    });

    await Payment.create({
      invoice: invoice._id,
      patient: invoice.patient._id,
      amount: invoice.totalAmount,
      paymentMethod: 'payhere',
      paymentStatus: 'pending',
      payhereOrderId: orderId,
    });

    const payhereUrl = process.env.PAYHERE_SANDBOX === 'true'
      ? 'https://sandbox.payhere.lk/pay/checkout'
      : 'https://www.payhere.lk/pay/checkout';

    res.status(200).json({
      success: true,
      data: {
        sandbox: process.env.PAYHERE_SANDBOX === 'true',
        merchant_id: process.env.PAYHERE_MERCHANT_ID,
        return_url: `${process.env.CLIENT_URL}/patient/bills`,
        cancel_url: `${process.env.CLIENT_URL}/patient/bills`,
        notify_url: `${req.protocol}://${req.get('host')}/api/payment/notify`,
        order_id: orderId,
        items: `Invoice ${invoice.invoiceNumber}`,
        currency,
        amount,
        first_name: invoice.patient.firstName,
        last_name: invoice.patient.lastName,
        email: invoice.patient.email || 'patient@hospital.lk',
        phone: invoice.patient.phone,
        address: invoice.patient.address?.street || 'Colombo',
        city: invoice.patient.address?.city || 'Colombo',
        country: 'Sri Lanka',
        hash,
        payhereUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const payhereNotify = async (req, res) => {
  try {
    const params = req.body;

    const isValid = verifyPayHereHash(params, process.env.PAYHERE_MERCHANT_SECRET);
    if (!isValid) {
      return res.status(400).send('Invalid hash');
    }

    const payment = await Payment.findOne({ payhereOrderId: params.order_id });
    if (!payment) {
      return res.status(404).send('Payment not found');
    }

    if (params.status_code === '2') {
      payment.paymentStatus = 'completed';
      payment.payherePaymentId = params.payment_id;
      payment.paidAt = new Date();
      await payment.save();

      await Invoice.findByIdAndUpdate(payment.invoice, { status: 'paid' });
    } else {
      payment.paymentStatus = 'failed';
      await payment.save();
    }

    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Error');
  }
};

const verifyPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ payhereOrderId: req.params.orderId })
      .populate('invoice');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { initiatePayment, payhereNotify, verifyPayment };
