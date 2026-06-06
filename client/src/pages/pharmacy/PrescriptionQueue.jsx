import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/helpers';

const PrescriptionQueue = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    api.get('/prescriptions/pharmacy/queue').then(({ data }) => {
      setPrescriptions(data.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetch(); }, []);

  const dispense = async (id) => {
    await api.put(`/prescriptions/${id}/dispense`);
    toast.success('Marked as dispensed');
    fetch();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Prescription Queue</h1>
      <div className="space-y-4">
        {prescriptions.map((rx) => (
          <div key={rx._id} className="card">
            <div className="flex justify-between mb-2">
              <p className="font-semibold">{rx.patient?.firstName} {rx.patient?.lastName}</p>
              <Badge status={rx.status} />
            </div>
            <p className="text-sm text-gray-500">Dr. {rx.doctor?.user?.name} | {formatDate(rx.createdAt)}</p>
            <div className="mt-2 space-y-1">
              {rx.medicines?.map((m, i) => (
                <p key={i} className="text-sm">{m.medicineName} - {m.dosage} x {m.quantity}</p>
              ))}
            </div>
            <button onClick={() => dispense(rx._id)} className="btn-primary mt-3 text-sm">Dispense</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrescriptionQueue;
