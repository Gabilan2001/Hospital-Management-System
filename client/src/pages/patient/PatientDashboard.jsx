import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Receipt, FlaskConical, Pill } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { useAuthUser } from '../../hooks/useAuth';
import { resolvePatientIdFromUser } from '../../utils/patientHelpers';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/helpers';

const PatientDashboard = () => {
  const user = useAuthUser();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ records: 0, prescriptions: 0, labResults: 0, pendingBills: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [apptRes, patientId] = await Promise.all([
          api.get('/appointments/my'),
          resolvePatientIdFromUser(api, user),
        ]);

        setAppointments(apptRes.data.data || []);

        if (patientId) {
          const [recordsRes, rxRes, labRes, billsRes] = await Promise.all([
            api.get(`/medical-records/patient/${patientId}`),
            api.get(`/prescriptions/patient/${patientId}`),
            api.get(`/lab/patient/${patientId}`),
            api.get(`/billing/invoices/patient/${patientId}`),
          ]);

          setStats({
            records: recordsRes.data.data?.length || 0,
            prescriptions: rxRes.data.data?.length || 0,
            labResults: labRes.data.data?.length || 0,
            pendingBills: billsRes.data.data?.filter((inv) => inv.status === 'pending').length || 0,
          });
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  const upcoming = appointments
    .filter((a) => ['scheduled', 'confirmed'].includes(a.status) && new Date(a.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Patient Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Appointments" value={appointments.length} icon={Calendar} color="blue" subtitle={`${completedCount} completed`} />
        <StatCard title="Upcoming" value={upcoming.length} icon={Calendar} color="green" subtitle="Scheduled & confirmed" />
        <StatCard title="Pending Bills" value={stats.pendingBills} icon={Receipt} color="orange" subtitle="Awaiting payment" />
        <StatCard title="Lab Results" value={stats.labResults} icon={FlaskConical} color="purple" subtitle={`${stats.prescriptions} prescriptions`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link to="/patient/records" className="block">
          <StatCard title="Medical Records" value={stats.records} icon={FileText} color="teal" subtitle="View visit history" />
        </Link>
        <Link to="/patient/prescriptions" className="block">
          <StatCard title="Prescriptions" value={stats.prescriptions} icon={Pill} color="blue" subtitle="View medications" />
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
          <Link to="/patient/book" className="btn-primary text-sm">Book New</Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((apt) => (
              <div key={apt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Dr. {apt.doctor?.user?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{apt.department?.name}</p>
                  <p className="text-sm text-gray-500">{formatDate(apt.date)} | {apt.timeSlot}</p>
                  {apt.queueNumber && (
                    <p className="text-xs text-primary-700 font-medium mt-1">Queue #{apt.queueNumber}</p>
                  )}
                </div>
                <Badge status={apt.status} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-center">
          <Link to="/patient/appointments" className="text-sm text-primary-700 hover:underline">
            View all appointments
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
