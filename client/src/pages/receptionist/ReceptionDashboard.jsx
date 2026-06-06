import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Calendar, ListOrdered } from 'lucide-react';
import api from '../../api/axiosInstance';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';

const ReceptionDashboard = () => {
  const [stats, setStats] = useState({ appointments: 0, patients: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      api.get(`/appointments?date=${today}`),
      api.get('/patients'),
    ]).then(([apts, pts]) => {
      setStats({ appointments: apts.data.count || 0, patients: pts.data.count || 0 });
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reception Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Today's Appointments" value={stats.appointments} icon={Calendar} color="purple" />
        <StatCard title="Total Patients" value={stats.patients} icon={UserPlus} color="blue" />
        <Link to="/reception/queue"><StatCard title="Queue" value="Manage" icon={ListOrdered} color="green" /></Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/reception/register" className="card hover:shadow-md text-center py-8">
          <UserPlus size={32} className="mx-auto text-purple-600 mb-2" />
          <p className="font-semibold">Register Patient</p>
        </Link>
        <Link to="/reception/appointments" className="card hover:shadow-md text-center py-8">
          <Calendar size={32} className="mx-auto text-purple-600 mb-2" />
          <p className="font-semibold">Manage Appointments</p>
        </Link>
      </div>
    </div>
  );
};

export default ReceptionDashboard;
