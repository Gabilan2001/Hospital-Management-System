export const formatCurrency = (amount) => {
  return `LKR ${parseFloat(amount || 0).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return `${formatDate(date)} ${new Date(date).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}`;
};

export const getStatusColor = (status) => {
  const colors = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-indigo-100 text-indigo-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    'no-show': 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-orange-100 text-orange-800',
    waiting: 'bg-blue-100 text-blue-800',
    skipped: 'bg-gray-100 text-gray-800',
    admitted: 'bg-purple-100 text-purple-800',
    discharged: 'bg-green-100 text-green-800',
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    maintenance: 'bg-gray-100 text-gray-800',
    dispensed: 'bg-green-100 text-green-800',
    processing: 'bg-yellow-100 text-yellow-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const roleLabels = {
  admin: 'Administrator',
  doctor: 'Doctor',
  nurse: 'Nurse',
  receptionist: 'Receptionist',
  lab_technician: 'Lab Technician',
  pharmacist: 'Pharmacist',
  billing: 'Billing Staff',
  patient: 'Patient',
};

export const formatDoctorName = (name) => {
  if (!name) return 'N/A';
  const trimmed = name.trim();
  return /^dr\.?\s/i.test(trimmed) ? trimmed : `Dr. ${trimmed}`;
};

export const getRoleDashboard = (role) => {
  const routes = {
    admin: '/admin',
    doctor: '/doctor',
    nurse: '/nurse',
    receptionist: '/reception',
    lab_technician: '/lab',
    pharmacist: '/pharmacy',
    billing: '/billing',
    patient: '/patient',
  };
  return routes[role] || '/login';
};
