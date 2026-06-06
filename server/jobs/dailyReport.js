const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Patient = require('../models/Patient');
const Bed = require('../models/Bed');
const sendEmail = require('../utils/sendEmail');

const dailyReport = async () => {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const yesterday = new Date(start);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEnd = new Date(end);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    const appointments = await Appointment.countDocuments({
      date: { $gte: yesterday, $lte: yesterdayEnd },
    });

    const completed = await Appointment.countDocuments({
      date: { $gte: yesterday, $lte: yesterdayEnd },
      status: 'completed',
    });

    const payments = await Payment.find({
      paymentStatus: 'completed',
      paidAt: { $gte: yesterday, $lte: yesterdayEnd },
    });

    const revenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const newPatients = await Patient.countDocuments({
      createdAt: { $gte: yesterday, $lte: yesterdayEnd },
    });

    const totalBeds = await Bed.countDocuments();
    const occupiedBeds = await Bed.countDocuments({ status: 'occupied' });

    const reportHtml = `
      <h2>CareLink Hospital - Daily Report</h2>
      <p>Date: ${yesterday.toLocaleDateString('en-GB')}</p>
      <ul>
        <li>Total Appointments: ${appointments}</li>
        <li>Completed: ${completed}</li>
        <li>Revenue: LKR ${revenue.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</li>
        <li>New Patients: ${newPatients}</li>
        <li>Bed Occupancy: ${occupiedBeds}/${totalBeds}</li>
      </ul>
    `;

    if (process.env.OWNER_EMAIL) {
      try {
        await sendEmail({
          to: process.env.OWNER_EMAIL,
          subject: `Daily Report - ${yesterday.toLocaleDateString('en-GB')}`,
          html: reportHtml,
        });
        console.log('Daily report email sent');
      } catch (err) {
        console.log('Daily report email failed:', err.message);
      }
    }
  } catch (error) {
    console.error('Daily report job error:', error.message);
  }
};

module.exports = dailyReport;
