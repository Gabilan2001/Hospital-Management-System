import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pill, AlertTriangle, Package } from 'lucide-react';
import api from '../../api/axiosInstance';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';

const PharmacyDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/prescriptions/pharmacy/queue'),
      api.get('/pharmacy/low-stock'),
    ]).then(([q, ls]) => {
      setQueue(q.data.data || []);
      setLowStock(ls.data.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pharmacy Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Pending Prescriptions" value={queue.length} icon={Pill} color="teal" />
        <StatCard title="Low Stock Items" value={lowStock.length} icon={AlertTriangle} color="red" />
        <Link to="/pharmacy/inventory"><StatCard title="Inventory" value="Manage" icon={Package} color="blue" /></Link>
      </div>
      {lowStock.length > 0 && (
        <div className="card bg-red-50 border-red-200">
          <h3 className="font-semibold text-red-800 mb-2">Low Stock Alert</h3>
          {lowStock.slice(0, 5).map((m) => (
            <p key={m._id} className="text-sm text-red-700">{m.name}: {m.stock} remaining</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default PharmacyDashboard;
