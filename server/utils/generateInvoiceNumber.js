const Invoice = require('../models/Invoice');

const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const lastInvoice = await Invoice.findOne({
    invoiceNumber: { $regex: `^${prefix}` },
  })
    .sort({ invoiceNumber: -1 })
    .select('invoiceNumber');

  let nextNumber = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const lastNum = parseInt(lastInvoice.invoiceNumber.split('-')[2], 10);
    if (!isNaN(lastNum)) {
      nextNumber = lastNum + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

module.exports = generateInvoiceNumber;
