import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import AppointmentCard from '../../components/appointment/AppointmentCard';
import { formatDate } from '../../utils/helpers';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/appointments/doctor/today')
      .then(({ data }) => setAppointments(data.data || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  const completed = appointments.filter((a) => a.status === 'completed').length;
  const inProgress = appointments.filter((a) => a.status === 'in-progress').length;
  const waiting = appointments.filter((a) => ['scheduled', 'confirmed'].includes(a.status)).length;

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Doctor Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Today's Appointments" value={appointments.length} icon={Calendar} color="blue" subtitle={formatDate(new Date())} />
        <StatCard title="Waiting" value={waiting} icon={Clock} color="orange" />
        <StatCard title="In Progress" value={inProgress} icon={Users} color="purple" />
        <StatCard title="Completed" value={completed} icon={CheckCircle} color="green" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Today's Appointments</h2>
          <Link to="/doctor/appointments" className="text-sm text-primary-700 hover:underline">
            View All
          </Link>
        </div>

        {appointments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No appointments scheduled for today</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((apt) => (
              <AppointmentCard
                key={apt._id}
                appointment={apt}
                onAction={() => navigate(`/doctor/patient/${apt.patient?._id}`)}
                actionLabel="View Patient"
              />
            ))}
          </div>
        )}
      </div>

      {appointments.some((a) => a.patient?.allergies?.length > 0) && (
        <div className="card mt-6 border-l-4 border-red-400">
          <h3 className="font-semibold text-red-700 mb-2">Allergy Alerts</h3>
          <div className="space-y-2">
            {appointments
              .filter((a) => a.patient?.allergies?.length > 0)
              .map((apt) => (
                <div key={apt._id} className="flex items-center justify-between text-sm">
                  <span>
                    {apt.patient.firstName} {apt.patient.lastName} — {apt.patient.allergies.join(', ')}
                  </span>
                  <Badge status="urgent">Allergy</Badge>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
