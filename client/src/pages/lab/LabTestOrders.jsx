import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/helpers';

const LabTestOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    api.get('/lab/pending').then(({ data }) => {
      setOrders(data.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetch(); }, []);

  const collect = async (id) => {
    await api.put(`/lab/${id}/collect`);
    toast.success('Sample collected');
    fetch();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Test Orders</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o._id} className="card">
            <div className="flex justify-between mb-2">
              <p className="font-semibold">{o.patient?.firstName} {o.patient?.lastName}</p>
              <Badge status={o.priority} />
            </div>
            <p className="text-sm text-gray-500 mb-2">{o.tests?.map((t) => t.name).join(', ')}</p>
            <p className="text-xs text-gray-400">{formatDate(o.orderedAt)} | Dr. {o.doctor?.user?.name}</p>
            {o.status === 'pending' && (
              <button onClick={() => collect(o._id)} className="btn-primary mt-3 text-sm">Collect Sample</button>
            )}
            {o.status === 'processing' && <Badge status="processing" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabTestOrders;
