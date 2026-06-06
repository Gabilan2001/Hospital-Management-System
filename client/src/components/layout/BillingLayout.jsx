import { Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, Receipt, History } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const menuItems = [
  { path: '/billing', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/billing/generate', label: 'Generate Invoice', icon: FileText },
  { path: '/billing/invoices', label: 'All Invoices', icon: Receipt },
  { path: '/billing/payments', label: 'Payment History', icon: History },
];

const BillingLayout = () => (
  <DashboardLayout menuItems={menuItems} accentColor="orange" roleLabel="Billing">
    <Outlet />
  </DashboardLayout>
);

export default BillingLayout;
