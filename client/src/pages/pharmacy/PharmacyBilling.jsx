import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDate } from '../../utils/helpers';

const PharmacyBilling = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pharmacy/dispense/history').then(({ data }) => {
      setHistory(data.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dispense History</h1>
      <div className="space-y-3">
        {history.map((d) => (
          <div key={d._id} className="card flex justify-between">
            <div>
              <p className="font-medium">{d.patient?.firstName} {d.patient?.lastName}</p>
              <p className="text-sm text-gray-500">{formatDate(d.dispensedAt)} | {d.items?.length} items</p>
            </div>
            <p className="font-bold text-primary-700">{formatCurrency(d.totalAmount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PharmacyBilling;
