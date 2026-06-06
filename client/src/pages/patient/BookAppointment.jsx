import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resolvePatientIdFromUser } from '../../utils/patientHelpers';
import { useAuthUser } from '../../hooks/useAuth';
import api from '../../api/axiosInstance';
import TimeSlotPicker from '../../components/appointment/TimeSlotPicker';
import Loader from '../../components/common/Loader';

const BookAppointment = () => {
  const user = useAuthUser();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [form, setForm] = useState({ department: '', doctor: '', date: '', timeSlot: '', symptoms: '' });
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [deptRes, pid] = await Promise.all([
          api.get('/departments'),
          resolvePatientIdFromUser(api, user),
        ]);
        setDepartments(deptRes.data.data || []);
        setPatientId(pid || '');
        if (!pid) {
          toast.error('Patient profile not found. Please contact reception.');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load booking form');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!form.department) {
      setDoctors([]);
      return;
    }
    api.get(`/doctors?department=${form.department}`)
      .then(({ data }) => setDoctors(data.data || []))
      .catch(() => toast.error('Failed to load doctors'));
  }, [form.department]);

  useEffect(() => {
    if (!form.doctor || !form.date) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setForm((prev) => ({ ...prev, timeSlot: '' }));
    api.get(`/doctors/${form.doctor}/slots?date=${form.date}`)
      .then(({ data }) => setSlots(data.data || []))
      .catch(() => toast.error('Failed to load time slots'))
      .finally(() => setLoadingSlots(false));
  }, [form.doctor, form.date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      toast.error('Patient profile not found. Please contact reception.');
      return;
    }
    if (!form.timeSlot) {
      toast.error('Please select a time slot');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/appointments', {
        patient: patientId,
        doctor: form.doctor,
        department: form.department,
        date: form.date,
        timeSlot: form.timeSlot,
        symptoms: form.symptoms,
        type: 'online',
      });
      toast.success('Appointment booked successfully');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Book Appointment</h1>
      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <select
            className="input-field"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value, doctor: '', timeSlot: '' })}
            required
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Doctor</label>
          <select
            className="input-field"
            value={form.doctor}
            onChange={(e) => setForm({ ...form, doctor: e.target.value, timeSlot: '' })}
            required
            disabled={!form.department}
          >
            <option value="">Select Doctor</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                Dr. {d.user?.name} — LKR {d.consultationFee?.toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            className="input-field"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value, timeSlot: '' })}
            required
            min={new Date().toISOString().split('T')[0]}
            disabled={!form.doctor}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Time Slot</label>
          <TimeSlotPicker
            slots={slots}
            selected={form.timeSlot}
            onSelect={(s) => setForm({ ...form, timeSlot: s })}
            loading={loadingSlots}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Symptoms</label>
          <textarea
            className="input-field"
            rows={3}
            value={form.symptoms}
            onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
            placeholder="Describe your symptoms or reason for visit"
          />
        </div>

        <button type="submit" disabled={submitting || !form.timeSlot || !patientId} className="btn-primary w-full">
          {submitting ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
};

export default BookAppointment;
