import { useEffect, useState } from 'react';
import { Pill } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { useAuthUser } from '../../hooks/useAuth';
import { resolvePatientIdFromUser } from '../../utils/patientHelpers';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/helpers';

const MyPrescriptions = () => {
  const user = useAuthUser();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const patientId = await resolvePatientIdFromUser(api, user);
        if (!patientId) {
          toast.error('Patient profile not found');
          return;
        }
        const { data } = await api.get(`/prescriptions/patient/${patientId}`);
        setPrescriptions(data.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Prescriptions</h1>

      {prescriptions.length === 0 ? (
        <div className="card text-center py-12">
          <Pill size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No prescriptions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div key={rx._id} className="card">
              <div className="flex flex-wrap justify-between gap-2 mb-3">
                <p className="font-semibold">Dr. {rx.doctor?.user?.name || 'N/A'}</p>
                <div className="flex items-center gap-2">
                  <Badge status={rx.status} />
                  <span className="text-sm text-gray-500">{formatDate(rx.createdAt)}</span>
                </div>
              </div>

              <div className="space-y-2">
                {rx.medicines?.map((m, i) => (
                  <div key={i} className="text-sm p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{m.medicineName || m.medicine?.name}</p>
                    <p className="text-gray-600 mt-1">
                      {m.dosage} | {m.frequency} | {m.duration}
                      {m.quantity ? ` | Qty: ${m.quantity}` : ''}
                    </p>
                    {m.instructions && (
                      <p className="text-gray-500 mt-1 text-xs">{m.instructions}</p>
                    )}
                  </div>
                ))}
              </div>

              {rx.notes && (
                <p className="text-sm text-gray-600 mt-3 border-t pt-3">{rx.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPrescriptions;
