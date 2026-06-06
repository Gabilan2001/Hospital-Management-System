import { Outlet } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, Upload, History } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const menuItems = [
  { path: '/lab', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/lab/orders', label: 'Test Orders', icon: FlaskConical },
  { path: '/lab/upload', label: 'Upload Results', icon: Upload },
  { path: '/lab/history', label: 'History', icon: History },
];

const LabLayout = () => (
  <DashboardLayout menuItems={menuItems} accentColor="amber" roleLabel="Laboratory">
    <Outlet />
  </DashboardLayout>
);

export default LabLayout;
