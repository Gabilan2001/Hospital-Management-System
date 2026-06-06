import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, DollarSign, FileText } from 'lucide-react';
import api from '../../api/axiosInstance';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/helpers';

const BillingDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard').then(({ data }) => {
      setStats(data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Billing Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Today's Revenue" value={formatCurrency(stats?.revenue)} icon={DollarSign} color="orange" />
        <Link to="/billing/invoices"><StatCard title="Invoices" value="View All" icon={Receipt} color="blue" /></Link>
        <Link to="/billing/generate"><StatCard title="Generate" value="New Invoice" icon={FileText} color="green" /></Link>
      </div>
    </div>
  );
};

export default BillingDashboard;
