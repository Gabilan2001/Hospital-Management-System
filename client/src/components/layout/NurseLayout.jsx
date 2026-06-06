import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, User } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const menuItems = [
  { path: '/nurse', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/nurse/ward-patients', label: 'Ward Patients', icon: Users },
  { path: '/nurse/vitals', label: 'Record Vitals', icon: Activity },
  { path: '/nurse/profile', label: 'Profile', icon: User },
];

const NurseLayout = () => (
  <DashboardLayout menuItems={menuItems} accentColor="green" roleLabel="Nurse Portal">
    <Outlet />
  </DashboardLayout>
);

export default NurseLayout;
