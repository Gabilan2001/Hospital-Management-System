const PDFDocument = require('pdfkit');

const formatCurrency = (amount) => {
  return `LKR ${parseFloat(amount || 0).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const generateInvoicePDF = (invoice, patient) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).fillColor('#1D4ED8').text('CareLink Hospital', { align: 'center' });
      doc.fontSize(12).fillColor('#333').text('Colombo, Sri Lanka', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text('INVOICE', { align: 'center' });
      doc.moveDown();

      doc.fontSize(10);
      doc.text(`Invoice No: ${invoice.invoiceNumber}`);
      doc.text(`Date: ${formatDate(invoice.createdAt)}`);
      doc.text(`Patient: ${patient.firstName} ${patient.lastName}`);
      doc.text(`Patient ID: ${patient.patientId}`);
      doc.moveDown();

      doc.fontSize(11).text('Items:', { underline: true });
      doc.moveDown(0.5);

      invoice.items.forEach((item) => {
        doc.text(
          `${item.description} | Qty: ${item.quantity} | ${formatCurrency(item.unitPrice)} | Total: ${formatCurrency(item.total)}`
        );
      });

      doc.moveDown();
      doc.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`);
      if (invoice.discount > 0) {
        doc.text(`Discount: -${formatCurrency(invoice.discount)}`);
      }
      if (invoice.tax > 0) {
        doc.text(`Tax: ${formatCurrency(invoice.tax)}`);
      }
      doc.fontSize(12).text(`Total: ${formatCurrency(invoice.totalAmount)}`, { bold: true });
      doc.fontSize(10).text(`Status: ${invoice.status.toUpperCase()}`);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const generatePrescriptionPDF = (prescription, patient, doctor) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).fillColor('#1D4ED8').text('CareLink Hospital', { align: 'center' });
      doc.fontSize(14).text('PRESCRIPTION', { align: 'center' });
      doc.moveDown();

      doc.fontSize(10);
      doc.text(`Patient: ${patient.firstName} ${patient.lastName} (${patient.patientId})`);
      doc.text(`Doctor: Dr. ${doctor.user?.name || 'N/A'}`);
      doc.text(`Date: ${formatDate(prescription.createdAt)}`);
      doc.moveDown();

      doc.fontSize(11).text('Medicines:', { underline: true });
      doc.moveDown(0.5);

      prescription.medicines.forEach((med, index) => {
        doc.text(`${index + 1}. ${med.medicineName}`);
        doc.text(`   Dosage: ${med.dosage} | Frequency: ${med.frequency}`);
        doc.text(`   Duration: ${med.duration} | Qty: ${med.quantity}`);
        if (med.instructions) doc.text(`   Instructions: ${med.instructions}`);
        doc.moveDown(0.3);
      });

      if (prescription.notes) {
        doc.moveDown();
        doc.text(`Notes: ${prescription.notes}`);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoicePDF, generatePrescriptionPDF, formatCurrency, formatDate };
