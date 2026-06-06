import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Clock, CheckCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';

const LabDashboard = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/lab/pending').then(({ data }) => {
      setPending(data.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  const urgent = pending.filter((p) => p.priority === 'urgent').length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Lab Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Pending Orders" value={pending.length} icon={FlaskConical} color="amber" />
        <StatCard title="Urgent" value={urgent} icon={Clock} color="red" />
        <Link to="/lab/history"><StatCard title="Completed" value="View" icon={CheckCircle} color="green" /></Link>
      </div>
      <div className="card">
        <h2 className="font-semibold mb-4">Pending Orders</h2>
        {pending.slice(0, 5).map((o) => (
          <div key={o._id} className="flex justify-between py-2 border-b text-sm">
            <span>{o.patient?.firstName} {o.patient?.lastName} - {o.tests?.map((t) => t.name).join(', ')}</span>
            <span className={o.priority === 'urgent' ? 'text-red-600 font-bold' : 'text-gray-500'}>{o.priority}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabDashboard;
