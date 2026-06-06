import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, Stethoscope, Building2, BedDouble,
  BarChart3, Settings, UserCog,
} from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
  { path: '/admin/staff', label: 'Staff', icon: UserCog },
  { path: '/admin/patients', label: 'Patients', icon: Users },
  { path: '/admin/departments', label: 'Departments', icon: Building2 },
  { path: '/admin/wards', label: 'Wards', icon: BedDouble },
  { path: '/admin/beds', label: 'Beds', icon: BedDouble },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminLayout = () => (
  <DashboardLayout menuItems={menuItems} accentColor="slate" roleLabel="Administration">
    <Outlet />
  </DashboardLayout>
);

export default AdminLayout;
