import { Outlet } from 'react-router-dom';
import { LayoutDashboard, ListOrdered, Pill, Package, Receipt } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const menuItems = [
  { path: '/pharmacy', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/pharmacy/queue', label: 'Prescription Queue', icon: ListOrdered },
  { path: '/pharmacy/dispense', label: 'Dispense Medicine', icon: Pill },
  { path: '/pharmacy/inventory', label: 'Inventory', icon: Package },
  { path: '/pharmacy/billing', label: 'Billing', icon: Receipt },
];

const PharmacyLayout = () => (
  <DashboardLayout menuItems={menuItems} accentColor="teal" roleLabel="Pharmacy">
    <Outlet />
  </DashboardLayout>
);

export default PharmacyLayout;
