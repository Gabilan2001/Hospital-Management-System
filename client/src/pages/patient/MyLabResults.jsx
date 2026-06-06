import { useEffect, useState } from 'react';
import { FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { useAuthUser } from '../../hooks/useAuth';
import { resolvePatientIdFromUser } from '../../utils/patientHelpers';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/helpers';

const MyLabResults = () => {
  const user = useAuthUser();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const patientId = await resolvePatientIdFromUser(api, user);
        if (!patientId) {
          toast.error('Patient profile not found');
          return;
        }
        const { data } = await api.get(`/lab/patient/${patientId}`);
        setResults(data.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load lab results');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Lab Results</h1>

      {results.length === 0 ? (
        <div className="card text-center py-12">
          <FlaskConical size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No lab results found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((r) => (
            <div key={r._id} className="card">
              <div className="flex flex-wrap justify-between gap-2 mb-3">
                <p className="font-semibold">{r.tests?.map((t) => t.name).join(', ')}</p>
                <Badge status={r.status} />
              </div>

              <p className="text-sm text-gray-500 mb-3">
                Ordered: {formatDate(r.orderedAt)} | Dr. {r.doctor?.user?.name || 'N/A'}
                {r.completedAt && ` | Completed: ${formatDate(r.completedAt)}`}
              </p>

              {r.results?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="py-2 font-medium">Test</th>
                        <th className="py-2 font-medium">Value</th>
                        <th className="py-2 font-medium">Unit</th>
                        <th className="py-2 font-medium">Normal Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.results.map((res, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2">{res.labTest?.name || r.tests?.[i]?.name || '-'}</td>
                          <td className={`py-2 ${res.isAbnormal ? 'text-red-600 font-bold' : ''}`}>
                            {res.value}
                          </td>
                          <td className="py-2 text-gray-600">{res.unit || '-'}</td>
                          <td className="py-2 text-gray-500">{res.normalRange || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Results pending</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLabResults;
