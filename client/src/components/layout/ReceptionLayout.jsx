import { Outlet } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Calendar, ListOrdered, User } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const menuItems = [
  { path: '/reception', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/reception/register', label: 'Register Patient', icon: UserPlus },
  { path: '/reception/appointments', label: 'Appointments', icon: Calendar },
  { path: '/reception/queue', label: 'Queue Management', icon: ListOrdered },
  { path: '/reception/profile', label: 'Profile', icon: User },
];

const ReceptionLayout = () => (
  <DashboardLayout menuItems={menuItems} accentColor="purple" roleLabel="Reception">
    <Outlet />
  </DashboardLayout>
);

export default ReceptionLayout;
