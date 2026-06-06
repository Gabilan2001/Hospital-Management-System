import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, Pill, FlaskConical, Receipt, User } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const menuItems = [
  { path: '/patient', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/patient/book', label: 'Book Appointment', icon: Calendar },
  { path: '/patient/appointments', label: 'My Appointments', icon: Calendar },
  { path: '/patient/records', label: 'Medical Records', icon: FileText },
  { path: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
  { path: '/patient/lab-results', label: 'Lab Results', icon: FlaskConical },
  { path: '/patient/bills', label: 'My Bills', icon: Receipt },
  { path: '/patient/profile', label: 'Profile', icon: User },
];

const PatientLayout = () => (
  <DashboardLayout menuItems={menuItems} accentColor="sky" roleLabel="Patient Portal">
    <Outlet />
  </DashboardLayout>
);

export default PatientLayout;
