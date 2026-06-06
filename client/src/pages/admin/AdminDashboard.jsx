import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Calendar, DollarSign, BedDouble, Stethoscope, TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { formatCurrency } from '../../utils/helpers';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import RevenueChart from '../../components/charts/RevenueChart';
import AppointmentChart from '../../components/charts/AppointmentChart';
import OccupancyChart from '../../components/charts/OccupancyChart';

const getDateRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const getMonthRange = (months) => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - months);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [appointmentData, setAppointmentData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const weekRange = getDateRange(7);
        const monthRange = getMonthRange(6);

        const [dashboardRes, revenueRes, apptRes, occupancyRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/reports/revenue', { params: monthRange }),
          api.get('/reports/appointments', { params: weekRange }),
          api.get('/reports/bed-occupancy'),
        ]);

        setStats(dashboardRes.data.data);

        const payments = revenueRes.data.data?.payments || [];
        const monthlyMap = {};
        payments.forEach((p) => {
          const d = new Date(p.paidAt);
          const key = d.toLocaleDateString('en-LK', { month: 'short', year: '2-digit' });
          monthlyMap[key] = (monthlyMap[key] || 0) + p.amount;
        });
        setRevenueData(Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue })));

        const appointments = apptRes.data.data?.appointments || [];
        const dailyMap = {};
        appointments.forEach((a) => {
          const key = new Date(a.date).toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric' });
          dailyMap[key] = (dailyMap[key] || 0) + 1;
        });
        setAppointmentData(Object.entries(dailyMap).map(([date, count]) => ({ date, count })));

        setOccupancyData(
          (occupancyRes.data.data || []).map((w) => ({
            ward: w.ward,
            occupied: w.occupied,
            available: w.available,
          }))
        );
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <Loader />;

  const occupancyRate = stats?.bedOccupancy?.total
    ? Math.round((stats.bedOccupancy.occupied / stats.bedOccupancy.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">CareLink Hospital — system overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Today's Appointments" value={stats?.appointments?.total || 0} icon={Calendar} color="blue" />
        <StatCard title="Completed" value={stats?.appointments?.completed || 0} icon={TrendingUp} color="green" subtitle="Today" />
        <StatCard title="Cancelled" value={stats?.appointments?.cancelled || 0} icon={Calendar} color="red" subtitle="Today" />
        <StatCard title="Today's Revenue" value={formatCurrency(stats?.revenue || 0)} icon={DollarSign} color="teal" />
        <StatCard title="New Patients" value={stats?.newPatients || 0} icon={Users} color="purple" subtitle="Today" />
        <StatCard
          title="Bed Occupancy"
          value={`${occupancyRate}%`}
          icon={BedDouble}
          color="orange"
          subtitle={`${stats?.bedOccupancy?.occupied || 0}/${stats?.bedOccupancy?.total || 0} beds`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueData.length ? revenueData : [{ month: 'No data', revenue: 0 }]} />
        <AppointmentChart data={appointmentData.length ? appointmentData : [{ date: 'No data', count: 0 }]} />
      </div>

      <OccupancyChart data={occupancyData.length ? occupancyData : [{ ward: 'No data', occupied: 0, available: 0 }]} />

      <div className="card">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Stethoscope size={18} />
          Quick Links
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Link to="/admin/doctors/add" className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-center">Add Doctor</Link>
          <Link to="/admin/staff" className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-center">Manage Staff</Link>
          <Link to="/admin/patients" className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-center">View Patients</Link>
          <Link to="/admin/reports" className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-center">Reports</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
