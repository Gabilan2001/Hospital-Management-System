import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import api from '../../api/axiosInstance';
import AppointmentCard from '../../components/appointment/AppointmentCard';
import BookAppointmentReception from './BookAppointmentReception';
import Loader from '../../components/common/Loader';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookForm, setShowBookForm] = useState(false);

  const fetchAppointments = () => {
    setLoading(true);
    api.get('/appointments')
      .then(({ data }) => setAppointments(data.data || []))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, []);

  const confirm = async (id) => {
    try {
      await api.put(`/appointments/${id}/confirm`);
      toast.success('Appointment confirmed');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm');
    }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleBookSuccess = () => {
    setShowBookForm(false);
    fetchAppointments();
  };

  if (loading && !showBookForm) return <Loader />;

  if (showBookForm) {
    return (
      <div>
        <BookAppointmentReception
          onSuccess={handleBookSuccess}
          onCancel={() => setShowBookForm(false)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Reception can book, confirm, and cancel appointments. Patients can also book online.
          </p>
        </div>
        <button type="button" onClick={() => setShowBookForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Book Appointment
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          No appointments yet.{' '}
          <button type="button" onClick={() => setShowBookForm(true)} className="text-primary-700 underline">
            Book one now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((apt) => (
            <div key={apt._id}>
              <AppointmentCard appointment={apt} />
              <div className="flex gap-2 mt-2">
                {apt.status === 'scheduled' && (
                  <button onClick={() => confirm(apt._id)} className="btn-primary flex-1 text-sm">Confirm</button>
                )}
                {!['cancelled', 'completed'].includes(apt.status) && (
                  <button onClick={() => cancel(apt._id)} className="btn-secondary flex-1 text-sm">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageAppointments;
