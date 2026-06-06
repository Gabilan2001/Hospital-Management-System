require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Department = require('./models/Department');
const Appointment = require('./models/Appointment');
const LabTest = require('./models/LabTest');
const Medicine = require('./models/Medicine');
const Ward = require('./models/Ward');
const Bed = require('./models/Bed');
const Queue = require('./models/Queue');
const generateQRCode = require('./utils/generateQRCode');

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const defaultSlots = weekdays.map((day) => ({
  day,
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 20,
  maxPatients: 20,
}));

const seedData = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany(), Patient.deleteMany(), Doctor.deleteMany(),
      Department.deleteMany(), Appointment.deleteMany(), LabTest.deleteMany(),
      Medicine.deleteMany(), Ward.deleteMany(), Bed.deleteMany(), Queue.deleteMany(),
    ]);

    console.log('Data cleared');

    const admin = await User.create({
      name: 'Admin', email: 'admin@hospital.lk', password: 'Admin@123', role: 'admin', phone: '0771234567',
    });
    const receptionist = await User.create({
      name: 'Reception', email: 'reception@hospital.lk', password: 'Reception@123', role: 'receptionist', phone: '0771234568',
    });
    const labTech = await User.create({
      name: 'Lab Tech', email: 'lab@hospital.lk', password: 'Lab@123', role: 'lab_technician', phone: '0771234569',
    });
    const pharmacist = await User.create({
      name: 'Pharmacist', email: 'pharmacy@hospital.lk', password: 'Pharmacy@123', role: 'pharmacist', phone: '0771234570',
    });
    const billing = await User.create({
      name: 'Billing', email: 'billing@hospital.lk', password: 'Billing@123', role: 'billing', phone: '0771234571',
    });
    const nurse = await User.create({
      name: 'Nurse Silva', email: 'nurse@hospital.lk', password: 'Nurse@123', role: 'nurse', phone: '0771234572',
    });

    const deptNames = [
      { name: 'Cardiology', description: 'Heart and cardiovascular care', icon: 'heart' },
      { name: 'Neurology', description: 'Brain and nervous system', icon: 'brain' },
      { name: 'Orthopedics', description: 'Bone and joint care', icon: 'bone' },
      { name: 'Pediatrics', description: 'Child healthcare', icon: 'baby' },
      { name: 'Gynecology', description: 'Women health', icon: 'user' },
      { name: 'General Medicine', description: 'General healthcare', icon: 'stethoscope' },
      { name: 'Dermatology', description: 'Skin care', icon: 'scan' },
      { name: 'ENT', description: 'Ear, nose and throat', icon: 'ear' },
    ];

    const departments = await Department.insertMany(deptNames);

    const doctorData = [
      { name: 'Dr. Kamal Perera', email: 'dr.perera@hospital.lk', spec: 'Cardiologist', qual: 'MBBS, MD (Cardiology)', fee: 2500, dept: 0 },
      { name: 'Dr. Nimal Fernando', email: 'dr.fernando@hospital.lk', spec: 'Neurologist', qual: 'MBBS, MD (Neurology)', fee: 3000, dept: 1 },
      { name: 'Dr. Sunil Jayawardena', email: 'dr.jayawardena@hospital.lk', spec: 'Orthopedic Surgeon', qual: 'MBBS, MS (Ortho)', fee: 2800, dept: 2 },
      { name: 'Dr. Malini Ratnayake', email: 'dr.ratnayake@hospital.lk', spec: 'Pediatrician', qual: 'MBBS, MD (Pediatrics)', fee: 2000, dept: 3 },
      { name: 'Dr. Priya Wickramasinghe', email: 'dr.wickramasinghe@hospital.lk', spec: 'Gynecologist', qual: 'MBBS, MD (Gyn)', fee: 2200, dept: 4 },
      { name: 'Dr. Ravi Gunasekara', email: 'dr.gunasekara@hospital.lk', spec: 'General Physician', qual: 'MBBS, MD (Medicine)', fee: 1500, dept: 5 },
      { name: 'Dr. Anjali Mendis', email: 'dr.mendis@hospital.lk', spec: 'Dermatologist', qual: 'MBBS, MD (Dermatology)', fee: 1800, dept: 6 },
      { name: 'Dr. Lasith Bandara', email: 'dr.bandara@hospital.lk', spec: 'ENT Specialist', qual: 'MBBS, MS (ENT)', fee: 2000, dept: 7 },
    ];

    const doctors = [];
    for (let i = 0; i < doctorData.length; i++) {
      const d = doctorData[i];
      const user = await User.create({
        name: d.name, email: d.email, password: 'Doctor@123', role: 'doctor', phone: `07712345${80 + i}`,
      });
      const doctor = await Doctor.create({
        user: user._id,
        doctorId: `DR-2026-${String(i + 1).padStart(3, '0')}`,
        department: departments[d.dept]._id,
        specialization: d.spec,
        qualification: d.qual,
        experience: 10 + i,
        licenseNumber: `SLMC-${1000 + i}`,
        bio: `Experienced ${d.spec} at CareLink Hospital`,
        availableSlots: defaultSlots,
        consultationFee: d.fee,
      });
      doctors.push(doctor);
      await Department.findByIdAndUpdate(departments[d.dept]._id, { head: doctor._id });
    }

    const patientNames = [
      { first: 'Kasun', last: 'Silva', gender: 'male', blood: 'O+', phone: '0711111111' },
      { first: 'Nadeesha', last: 'Fernando', gender: 'female', blood: 'A+', phone: '0712222222' },
      { first: 'Ruwan', last: 'Perera', gender: 'male', blood: 'B+', phone: '0713333333' },
      { first: 'Sanduni', last: 'Jayasinghe', gender: 'female', blood: 'AB+', phone: '0714444444' },
      { first: 'Tharindu', last: 'Wickramasinghe', gender: 'male', blood: 'O-', phone: '0715555555' },
      { first: 'Dilani', last: 'Ratnayake', gender: 'female', blood: 'A-', phone: '0716666666' },
      { first: 'Chaminda', last: 'Bandara', gender: 'male', blood: 'B-', phone: '0717777777' },
      { first: 'Ishara', last: 'Mendis', gender: 'female', blood: 'AB-', phone: '0718888888' },
      { first: 'Pasindu', last: 'Gunasekara', gender: 'male', blood: 'O+', phone: '0719999999' },
      { first: 'Ayesh', last: 'Karunaratne', gender: 'male', blood: 'A+', phone: '0710000000' },
    ];

    const patients = [];
    for (let i = 0; i < patientNames.length; i++) {
      const p = patientNames[i];
      const patientId = `PT-2026-${String(i + 1).padStart(4, '0')}`;
      const qrCode = await generateQRCode(patientId);
      const patient = await Patient.create({
        patientId,
        firstName: p.first,
        lastName: p.last,
        dateOfBirth: new Date(1980 + i * 3, i, 15),
        gender: p.gender,
        bloodGroup: p.blood,
        phone: p.phone,
        email: `${p.first.toLowerCase()}@email.lk`,
        address: { street: `${i + 1} Main St`, city: 'Colombo', province: 'Western' },
        emergencyContact: { name: 'Family Member', phone: '0779999999', relationship: 'Spouse' },
        allergies: i % 2 === 0 ? ['Penicillin'] : [],
        chronicConditions: i % 3 === 0 ? ['Diabetes'] : [],
        qrCode,
      });
      patients.push(patient);
    }

    const labTests = [
      { name: 'Complete Blood Count', code: 'CBC', category: 'Hematology', price: 1500, normalRange: '4.5-11.0', unit: '10^9/L' },
      { name: 'Fasting Blood Sugar', code: 'FBS', category: 'Biochemistry', price: 800, normalRange: '70-100', unit: 'mg/dL' },
      { name: 'Random Blood Sugar', code: 'RBS', category: 'Biochemistry', price: 600, normalRange: '<140', unit: 'mg/dL' },
      { name: 'Lipid Profile', code: 'LIPID', category: 'Biochemistry', price: 2500, normalRange: 'Varies', unit: 'mg/dL' },
      { name: 'Liver Function Test', code: 'LFT', category: 'Biochemistry', price: 3000, normalRange: 'Varies', unit: 'U/L' },
      { name: 'Renal Function Test', code: 'RFT', category: 'Biochemistry', price: 2800, normalRange: 'Varies', unit: 'mg/dL' },
      { name: 'Thyroid (TSH)', code: 'TSH', category: 'Endocrinology', price: 2000, normalRange: '0.4-4.0', unit: 'mIU/L' },
      { name: 'ECG', code: 'ECG', category: 'Cardiology', price: 1500, normalRange: 'Normal', unit: '' },
      { name: 'X-Ray Chest', code: 'XRAY', category: 'Radiology', price: 2000, normalRange: 'Normal', unit: '' },
      { name: 'Urine Full Report', code: 'UFR', category: 'Pathology', price: 800, normalRange: 'Normal', unit: '' },
      { name: 'HbA1c', code: 'HBA1C', category: 'Biochemistry', price: 1800, normalRange: '4.0-5.6', unit: '%' },
      { name: 'Dengue NS1', code: 'NS1', category: 'Serology', price: 3500, normalRange: 'Negative', unit: '' },
      { name: 'COVID Antigen', code: 'COVID', category: 'Serology', price: 2500, normalRange: 'Negative', unit: '' },
      { name: 'Platelet Count', code: 'PLT', category: 'Hematology', price: 600, normalRange: '150-400', unit: '10^9/L' },
      { name: 'ESR', code: 'ESR', category: 'Hematology', price: 500, normalRange: '0-20', unit: 'mm/hr' },
      { name: 'CRP', code: 'CRP', category: 'Biochemistry', price: 1200, normalRange: '<10', unit: 'mg/L' },
    ];
    await LabTest.insertMany(labTests);

    const medicines = [
      { name: 'Panadol 500mg', genericName: 'Paracetamol', brand: 'GSK', category: 'Analgesic', barcode: 'MED001', price: 5, costPrice: 3, stock: 500, unit: 'tablet' },
      { name: 'Amoxil 500mg', genericName: 'Amoxicillin', brand: 'GSK', category: 'Antibiotic', barcode: 'MED002', price: 25, costPrice: 15, stock: 200, unit: 'capsule' },
      { name: 'Metformin 500mg', genericName: 'Metformin', brand: 'State Pharma', category: 'Antidiabetic', barcode: 'MED003', price: 8, costPrice: 4, stock: 300, unit: 'tablet' },
      { name: 'Losartan 50mg', genericName: 'Losartan', brand: 'State Pharma', category: 'Antihypertensive', barcode: 'MED004', price: 12, costPrice: 6, stock: 250, unit: 'tablet' },
      { name: 'Omeprazole 20mg', genericName: 'Omeprazole', brand: 'AstraZeneca', category: 'Antacid', barcode: 'MED005', price: 15, costPrice: 8, stock: 180, unit: 'capsule' },
      { name: 'Cetirizine 10mg', genericName: 'Cetirizine', brand: 'State Pharma', category: 'Antihistamine', barcode: 'MED006', price: 6, costPrice: 3, stock: 400, unit: 'tablet' },
      { name: 'Aspirin 75mg', genericName: 'Aspirin', brand: 'Bayer', category: 'Antiplatelet', barcode: 'MED007', price: 4, costPrice: 2, stock: 350, unit: 'tablet' },
      { name: 'Atorvastatin 20mg', genericName: 'Atorvastatin', brand: 'Pfizer', category: 'Statin', barcode: 'MED008', price: 35, costPrice: 20, stock: 150, unit: 'tablet' },
      { name: 'Salbutamol Inhaler', genericName: 'Salbutamol', brand: 'GSK', category: 'Bronchodilator', barcode: 'MED009', price: 450, costPrice: 300, stock: 50, unit: 'pcs' },
      { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', brand: 'State Pharma', category: 'NSAID', barcode: 'MED010', price: 8, costPrice: 4, stock: 280, unit: 'tablet' },
      { name: 'Vitamin C 500mg', genericName: 'Ascorbic Acid', brand: 'State Pharma', category: 'Vitamin', barcode: 'MED011', price: 3, costPrice: 1.5, stock: 600, unit: 'tablet' },
      { name: 'Calcium + Vit D', genericName: 'Calcium Carbonate', brand: 'State Pharma', category: 'Supplement', barcode: 'MED012', price: 10, costPrice: 5, stock: 200, unit: 'tablet' },
      { name: 'Azithromycin 500mg', genericName: 'Azithromycin', brand: 'Pfizer', category: 'Antibiotic', barcode: 'MED013', price: 45, costPrice: 25, stock: 100, unit: 'tablet' },
      { name: 'Diclofenac Gel', genericName: 'Diclofenac', brand: 'Novartis', category: 'Topical', barcode: 'MED014', price: 280, costPrice: 180, stock: 80, unit: 'pcs' },
      { name: 'ORS Sachet', genericName: 'Oral Rehydration Salt', brand: 'State Pharma', category: 'Rehydration', barcode: 'MED015', price: 15, costPrice: 8, stock: 400, unit: 'pcs' },
      { name: 'Insulin Glargine', genericName: 'Insulin Glargine', brand: 'Sanofi', category: 'Antidiabetic', barcode: 'MED016', price: 3500, costPrice: 2800, stock: 30, unit: 'pcs' },
      { name: 'Prednisolone 5mg', genericName: 'Prednisolone', brand: 'State Pharma', category: 'Steroid', barcode: 'MED017', price: 5, costPrice: 2.5, stock: 220, unit: 'tablet' },
      { name: 'Ferrous Sulfate', genericName: 'Iron', brand: 'State Pharma', category: 'Supplement', barcode: 'MED018', price: 4, costPrice: 2, stock: 350, unit: 'tablet' },
      { name: 'Domperidone 10mg', genericName: 'Domperidone', brand: 'Janssen', category: 'Antiemetic', barcode: 'MED019', price: 8, costPrice: 4, stock: 180, unit: 'tablet' },
      { name: 'Clopidogrel 75mg', genericName: 'Clopidogrel', brand: 'Sanofi', category: 'Antiplatelet', barcode: 'MED020', price: 28, costPrice: 15, stock: 120, unit: 'tablet' },
    ];
    await Medicine.insertMany(medicines);

    const wardConfigs = [
      { name: 'General Ward', type: 'general', floor: 2, beds: 20, price: 2500 },
      { name: 'ICU', type: 'icu', floor: 3, beds: 10, price: 15000 },
      { name: 'Private Ward', type: 'private', floor: 4, beds: 10, price: 8000 },
      { name: 'Maternity Ward', type: 'maternity', floor: 2, beds: 8, price: 5000 },
      { name: 'Pediatric Ward', type: 'pediatric', floor: 2, beds: 10, price: 3500 },
    ];

    for (const wc of wardConfigs) {
      const ward = await Ward.create({
        name: wc.name, type: wc.type, floor: wc.floor,
        totalBeds: wc.beds, availableBeds: wc.beds,
        description: `${wc.name} - CareLink Hospital`,
      });
      for (let b = 1; b <= wc.beds; b++) {
        await Bed.create({
          bedNumber: `${wc.name.charAt(0)}-${String(b).padStart(2, '0')}`,
          ward: ward._id,
          type: wc.type === 'icu' ? 'icu' : wc.type === 'private' ? 'private' : 'general',
          status: 'available',
          pricePerDay: wc.price,
        });
      }
    }

    const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'in-progress'];
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const aptDate = new Date(today);
      aptDate.setDate(aptDate.getDate() + (i % 5) - 2);
      const doctor = doctors[i % doctors.length];
      const patient = patients[i];
      const dept = departments[i % departments.length];

      const appointment = await Appointment.create({
        patient: patient._id,
        doctor: doctor._id,
        department: dept._id,
        date: aptDate,
        timeSlot: `${String(9 + i).padStart(2, '0')}:00 - ${String(9 + i).padStart(2, '0')}:20`,
        appointmentNumber: `A-${String(i + 1).padStart(3, '0')}`,
        status: statuses[i % statuses.length],
        symptoms: 'General checkup',
        queueNumber: i + 1,
      });

      if (['scheduled', 'confirmed', 'in-progress'].includes(statuses[i % statuses.length])) {
        await Queue.create({
          doctor: doctor._id,
          date: aptDate,
          patient: patient._id,
          appointment: appointment._id,
          queueNumber: i + 1,
          status: statuses[i % statuses.length] === 'in-progress' ? 'in-progress' : 'waiting',
        });
      }
    }

    console.log('Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@hospital.lk / Admin@123');
    console.log('Doctors: dr.perera@hospital.lk / Doctor@123');
    console.log('Receptionist: reception@hospital.lk / Reception@123');
    console.log('Lab Tech: lab@hospital.lk / Lab@123');
    console.log('Pharmacist: pharmacy@hospital.lk / Pharmacy@123');
    console.log('Billing: billing@hospital.lk / Billing@123');
    console.log('Nurse: nurse@hospital.lk / Nurse@123');

    process.exit(0);
  } catch (error) {
    console.error('Seeder error:', error);
    process.exit(1);
  }
};

seedData();
