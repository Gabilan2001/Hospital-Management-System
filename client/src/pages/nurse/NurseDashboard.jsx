import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bed, Activity, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import AdmissionCard from '../../components/ward/AdmissionCard';
import { formatDate } from '../../utils/helpers';

const NurseDashboard = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/wards/admissions')
      .then(({ data }) => setAdmissions(data.data || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load ward data'))
      .finally(() => setLoading(false));
  }, []);

  const wards = [...new Set(admissions.map((a) => a.ward?.name).filter(Boolean))];
  const icuCount = admissions.filter((a) => a.ward?.type === 'icu').length;

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nurse Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Admitted Patients" value={admissions.length} icon={Users} color="green" />
        <StatCard title="Active Wards" value={wards.length} icon={Building2} color="blue" />
        <StatCard title="ICU Patients" value={icuCount} icon={Bed} color="red" />
        <Link to="/nurse/vitals">
          <StatCard title="Record Vitals" value="Go" icon={Activity} color="purple" />
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Admitted Patients</h2>
          <Link to="/nurse/ward-patients" className="text-sm text-green-700 hover:underline">
            View All
          </Link>
        </div>

        {admissions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No patients currently admitted</p>
        ) : (
          <div className="space-y-3">
            {admissions.slice(0, 6).map((admission) => (
              <div key={admission._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    {admission.patient?.firstName} {admission.patient?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {admission.ward?.name} — Bed {admission.bed?.bedNumber} | Admitted {formatDate(admission.admissionDate)}
                  </p>
                </div>
                <Badge status={admission.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {admissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {admissions.slice(0, 3).map((admission) => (
            <AdmissionCard key={admission._id} admission={admission} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NurseDashboard;
