const Patient = require('../models/Patient');

const generatePatientId = async () => {
  const year = new Date().getFullYear();
  const prefix = `PT-${year}-`;

  const lastPatient = await Patient.findOne({
    patientId: { $regex: `^${prefix}` },
  })
    .sort({ patientId: -1 })
    .select('patientId');

  let nextNumber = 1;
  if (lastPatient && lastPatient.patientId) {
    const lastNum = parseInt(lastPatient.patientId.split('-')[2], 10);
    if (!isNaN(lastNum)) {
      nextNumber = lastNum + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

module.exports = generatePatientId;
