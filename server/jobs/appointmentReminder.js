const Appointment = require('../models/Appointment');
const sendWhatsApp = require('../utils/sendWhatsApp');

const appointmentReminder = async () => {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const oneHourTenLater = new Date(now.getTime() + 70 * 60 * 1000);

    const appointments = await Appointment.find({
      date: { $gte: oneHourLater, $lte: oneHourTenLater },
      status: { $in: ['scheduled', 'confirmed'] },
      reminderSent: false,
    })
      .populate('patient', 'firstName lastName phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    for (const apt of appointments) {
      const doctorName = apt.doctor?.user?.name || 'Doctor';
      const message = `⏰ Reminder: You have an appointment in 1 hour!\n👨‍⚕️ Dr. ${doctorName} | ${apt.timeSlot}\n🏥 CareLink Hospital`;

      try {
        if (apt.patient?.phone) {
          await sendWhatsApp(apt.patient.phone, message);
        }
        apt.reminderSent = true;
        await apt.save();
      } catch (err) {
        console.log(`Reminder failed for appointment ${apt._id}:`, err.message);
      }
    }

    if (appointments.length > 0) {
      console.log(`Sent ${appointments.length} appointment reminders`);
    }
  } catch (error) {
    console.error('Appointment reminder job error:', error.message);
  }
};

module.exports = appointmentReminder;
