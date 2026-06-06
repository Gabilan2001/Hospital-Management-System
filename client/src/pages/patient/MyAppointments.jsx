import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import AppointmentCard from '../../components/appointment/AppointmentCard';
import TimeSlotPicker from '../../components/appointment/TimeSlotPicker';
import ConfirmModal from '../../components/common/ConfirmModal';
import Loader from '../../components/common/Loader';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const [rescheduleApt, setRescheduleApt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);

  const fetchAppointments = () => {
    setLoading(true);
    api.get('/appointments/my')
      .then(({ data }) => setAppointments(data.data || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load appointments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (!rescheduleApt || !rescheduleDate) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setRescheduleSlot('');
    api.get(`/doctors/${rescheduleApt.doctor._id}/slots?date=${rescheduleDate}`)
      .then(({ data }) => setSlots(data.data || []))
      .catch(() => toast.error('Failed to load time slots'))
      .finally(() => setLoadingSlots(false));
  }, [rescheduleApt, rescheduleDate]);

  const handleCancel = async () => {
    try {
      await api.put(`/appointments/${cancelId}/cancel`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const openReschedule = (apt) => {
    setRescheduleApt(apt);
    setRescheduleDate('');
    setRescheduleSlot('');
    setSlots([]);
  };

  const closeReschedule = () => {
    setRescheduleApt(null);
    setRescheduleDate('');
    setRescheduleSlot('');
    setSlots([]);
  };

  const handleReschedule = async () => {
    if (!rescheduleSlot) {
      toast.error('Please select a time slot');
      return;
    }
    setRescheduling(true);
    try {
      await api.put(`/appointments/${rescheduleApt._id}/reschedule`, {
        date: rescheduleDate,
        timeSlot: rescheduleSlot,
      });
      toast.success('Appointment rescheduled');
      closeReschedule();
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reschedule failed');
    } finally {
      setRescheduling(false);
    }
  };

  const canModify = (status) => ['scheduled', 'confirmed'].includes(status);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>

      {appointments.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">No appointments found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((apt) => (
            <div key={apt._id} className="flex flex-col">
              <AppointmentCard appointment={apt} />
              {canModify(apt.status) && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => openReschedule(apt)}
                    className="btn-secondary flex-1 text-sm"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => setCancelId(apt._id)}
                    className="flex-1 text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
        confirmText="Cancel Appointment"
        danger
      />

      {rescheduleApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Reschedule Appointment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Dr. {rescheduleApt.doctor?.user?.name} — {rescheduleApt.department?.name}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {rescheduleDate && (
                <div>
                  <label className="block text-sm font-medium mb-2">New Time Slot</label>
                  <TimeSlotPicker
                    slots={slots}
                    selected={rescheduleSlot}
                    onSelect={setRescheduleSlot}
                    loading={loadingSlots}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeReschedule} className="btn-secondary">Close</button>
              <button
                onClick={handleReschedule}
                disabled={rescheduling || !rescheduleSlot}
                className="btn-primary"
              >
                {rescheduling ? 'Saving...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
