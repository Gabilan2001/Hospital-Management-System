import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import AppointmentCalendar from '../../components/appointment/AppointmentCalendar';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/helpers';

const DoctorSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/appointments/doctor/upcoming')
      .then(({ data }) => {
        const events = (data.data || []).map((apt) => ({
          ...apt,
          title: `${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''}`.trim(),
        }));
        setAppointments(events);
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load schedule'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Schedule</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AppointmentCalendar
            events={appointments}
            onSelectEvent={(event) => setSelected(event.resource)}
          />
        </div>

        <div className="card h-fit">
          <h2 className="text-lg font-semibold mb-4">Appointment Details</h2>
          {!selected ? (
            <p className="text-gray-500 text-sm">Select an appointment on the calendar to view details</p>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Patient</p>
                <p className="font-semibold">
                  {selected.patient?.firstName} {selected.patient?.lastName}
                </p>
                <p className="text-xs text-gray-500">{selected.patient?.patientId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Date & Time</p>
                <p>{formatDate(selected.date)} | {selected.timeSlot}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Department</p>
                <p>{selected.department?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <Badge status={selected.status} />
              </div>
              {selected.symptoms && (
                <div>
                  <p className="text-xs text-gray-400">Symptoms</p>
                  <p className="text-sm text-gray-600">{selected.symptoms}</p>
                </div>
              )}
              <button
                onClick={() => navigate(`/doctor/patient/${selected.patient?._id}`)}
                className="btn-primary w-full text-sm mt-2"
              >
                View Patient Record
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;
