import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import AdmissionCard from '../../components/ward/AdmissionCard';

const WardPatients = () => {
  const [admissions, setAdmissions] = useState([]);
  const [wardFilter, setWardFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/wards/admissions')
      .then(({ data }) => setAdmissions(data.data || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load admissions'))
      .finally(() => setLoading(false));
  }, []);

  const wards = [...new Map(
    admissions.map((a) => [a.ward?._id, a.ward]).filter(([id]) => id)
  ).values()];

  const filtered = wardFilter
    ? admissions.filter((a) => a.ward?._id === wardFilter)
    : admissions;

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Ward Patients</h1>
        <Link to="/nurse/vitals" className="btn-primary text-sm">Record Vitals</Link>
      </div>

      {wards.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setWardFilter('')}
            className={`px-3 py-1.5 rounded-lg text-sm ${!wardFilter ? 'bg-green-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            All Wards ({admissions.length})
          </button>
          {wards.map((ward) => {
            const count = admissions.filter((a) => a.ward?._id === ward._id).length;
            return (
              <button
                key={ward._id}
                onClick={() => setWardFilter(ward._id)}
                className={`px-3 py-1.5 rounded-lg text-sm ${wardFilter === ward._id ? 'bg-green-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {ward.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">No admitted patients found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((admission) => (
            <AdmissionCard key={admission._id} admission={admission} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WardPatients;
