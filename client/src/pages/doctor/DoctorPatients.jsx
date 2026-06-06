import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/helpers';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const fetchPatients = async (searchQuery = '') => {
    setSearching(true);
    try {
      const endpoint = searchQuery.trim()
        ? `/patients/search?q=${encodeURIComponent(searchQuery.trim())}`
        : '/patients';
      const { data } = await api.get(endpoint);
      setPatients(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load patients');
    } finally {
      setSearching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) fetchPatients(query);
      else if (!loading) fetchPatients('');
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Patients</h1>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="input-field pl-10"
          placeholder="Search by name, patient ID, or phone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {searching ? (
        <Loader />
      ) : patients.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">No patients found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <div key={patient._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User size={20} className="text-blue-700" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{patient.patientId}</p>
                </div>
                <Badge status={patient.gender}>{patient.gender}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                <div>
                  <p className="text-xs text-gray-400">Blood Group</p>
                  <p>{patient.bloodGroup || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p>{patient.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date of Birth</p>
                  <p>{formatDate(patient.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">City</p>
                  <p>{patient.address?.city || '—'}</p>
                </div>
              </div>

              {patient.allergies?.length > 0 && (
                <p className="text-xs text-red-600 mb-3">
                  Allergies: {patient.allergies.join(', ')}
                </p>
              )}

              <Link to={`/doctor/patient/${patient._id}`} className="btn-primary w-full text-sm text-center block">
                View Full History
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
