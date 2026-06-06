import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/helpers';

const LabHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/lab/orders?status=completed').then(({ data }) => {
      setOrders(data.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Lab History</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o._id} className="card flex justify-between items-center">
            <div>
              <p className="font-medium">{o.patient?.firstName} {o.patient?.lastName}</p>
              <p className="text-sm text-gray-500">{o.tests?.map((t) => t.name).join(', ')}</p>
              <p className="text-xs text-gray-400">{formatDate(o.completedAt)}</p>
            </div>
            <Badge status="completed" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabHistory;
