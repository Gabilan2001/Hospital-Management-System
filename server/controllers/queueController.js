const Queue = require('../models/Queue');
const Doctor = require('../models/Doctor');
const { emitQueueUpdate } = require('../socket/socketHandler');

const getDayRange = (dateStr) => {
  const base = dateStr ? new Date(`${dateStr}T12:00:00`) : new Date();
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);
  const end = new Date(base);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getColomboToday = () => getDayRange();

const getQueueDisplay = async (req, res) => {
  try {
    const { start, end } = getColomboToday();

    const doctors = await Doctor.find({ isAvailable: true })
      .populate('user', 'name')
      .populate('department', 'name');

    const display = await Promise.all(
      doctors.map(async (doctor) => {
        const queues = await Queue.find({
          doctor: doctor._id,
          date: { $gte: start, $lte: end },
          status: { $in: ['waiting', 'in-progress'] },
        })
          .populate('patient', 'firstName lastName')
          .sort({ queueNumber: 1 });

        const current = queues.find((q) => q.status === 'in-progress');
        const waiting = queues.filter((q) => q.status === 'waiting');

        return {
          doctor: {
            _id: doctor._id,
            name: doctor.user?.name,
            department: doctor.department?.name,
          },
          current: current
            ? { queueNumber: current.queueNumber, patient: current.patient }
            : null,
          next: waiting.slice(0, 3).map((q) => ({
            queueNumber: q.queueNumber,
            patient: q.patient,
          })),
        };
      })
    );

    res.status(200).json({ success: true, data: display });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctorQueue = async (req, res) => {
  try {
    const { start, end } = getDayRange(req.query.date);

    const queues = await Queue.find({
      doctor: req.params.doctorId,
      date: { $gte: start, $lte: end },
      status: { $nin: ['completed', 'skipped', 'cancelled'] },
    })
      .populate('patient', 'firstName lastName patientId phone')
      .populate('appointment')
      .sort({ queueNumber: 1 });

    res.status(200).json({ success: true, data: queues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addToQueue = async (req, res) => {
  try {
    const { doctor, date, patient, appointment } = req.body;
    const queueDate = new Date(date);
    const { start, end } = getColomboToday();

    const lastQueue = await Queue.findOne({
      doctor,
      date: { $gte: start, $lte: end },
    }).sort({ queueNumber: -1 });

    const queueNumber = (lastQueue?.queueNumber || 0) + 1;

    const queue = await Queue.create({
      doctor,
      date: queueDate,
      patient,
      appointment,
      queueNumber,
    });

    const populated = await Queue.findById(queue._id)
      .populate('patient', 'firstName lastName')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    const io = req.app.get('io');
    emitQueueUpdate(io, doctor, populated);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const callNextPatient = async (req, res) => {
  try {
    await Queue.findByIdAndUpdate(req.params.id, {
      status: 'in-progress',
      calledAt: new Date(),
    });

    const queue = await Queue.findById(req.params.id)
      .populate('patient', 'firstName lastName')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    const io = req.app.get('io');
    emitQueueUpdate(io, queue.doctor._id.toString(), queue);

    res.status(200).json({ success: true, data: queue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const completeQueue = async (req, res) => {
  try {
    const queue = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );

    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue entry not found' });
    }

    const io = req.app.get('io');
    emitQueueUpdate(io, queue.doctor.toString(), queue);

    res.status(200).json({ success: true, data: queue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const skipPatient = async (req, res) => {
  try {
    const queue = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: 'skipped' },
      { new: true }
    );

    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue entry not found' });
    }

    const io = req.app.get('io');
    emitQueueUpdate(io, queue.doctor.toString(), queue);

    res.status(200).json({ success: true, data: queue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQueueDisplay, getDoctorQueue, addToQueue,
  callNextPatient, completeQueue, skipPatient,
};
