import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { useAuth } from '../../hooks/useAuth';
import AppointmentCard from '../../components/appointment/AppointmentCard';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';

const STATUS_OPTIONS = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const fetchAppointments = async (docId) => {
    const params = docId ? { doctor: docId } : {};
    if (filter) params.status = filter;
    const { data } = await api.get('/appointments', { params });
    setAppointments(data.data || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data: doctorsData } = await api.get('/doctors');
        const profile = (doctorsData.data || []).find(
          (d) => d.user?._id === user?._id || d.user === user?._id
        );
        if (profile) {
          setDoctorId(profile._id);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  useEffect(() => {
    if (doctorId) fetchAppointments(doctorId);
  }, [filter, doctorId]);

  const handleStatusUpdate = async (appointmentId, status) => {
    setUpdatingId(appointmentId);
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status });
      toast.success('Status updated');
      await fetchAppointments(doctorId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Appointments</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-primary-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          All
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize ${filter === s ? 'bg-primary-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {s.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      {appointments.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">No appointments found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((apt) => (
            <div key={apt._id} className="card space-y-3">
              <AppointmentCard
                appointment={apt}
                onAction={() => navigate(`/doctor/patient/${apt.patient?._id}`)}
                actionLabel="View Patient"
              />
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Update Status</label>
                <select
                  className="input-field text-sm"
                  value={apt.status}
                  disabled={updatingId === apt._id}
                  onChange={(e) => handleStatusUpdate(apt._id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Current:</span>
                <Badge status={apt.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
