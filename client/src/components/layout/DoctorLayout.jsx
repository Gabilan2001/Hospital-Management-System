import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, FileText, Pill, FlaskConical, User } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const menuItems = [
  { path: '/doctor', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/doctor/schedule', label: 'Schedule', icon: Calendar },
  { path: '/doctor/appointments', label: 'Appointments', icon: Calendar },
  { path: '/doctor/patients', label: 'Patients', icon: Users },
  { path: '/doctor/prescription', label: 'Prescriptions', icon: Pill },
  { path: '/doctor/lab-order', label: 'Lab Orders', icon: FlaskConical },
  { path: '/doctor/profile', label: 'Profile', icon: User },
];

const DoctorLayout = () => (
  <DashboardLayout menuItems={menuItems} accentColor="blue" roleLabel="Doctor Portal">
    <Outlet />
  </DashboardLayout>
);

export default DoctorLayout;
