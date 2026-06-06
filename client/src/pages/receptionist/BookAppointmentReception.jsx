import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import TimeSlotPicker from '../../components/appointment/TimeSlotPicker';
import Loader from '../../components/common/Loader';
import { formatDoctorName } from '../../utils/helpers';

const BookAppointmentReception = ({ onSuccess, onCancel }) => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientQuery, setPatientQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form, setForm] = useState({ department: '', doctor: '', date: '', timeSlot: '', symptoms: '', type: 'walk-in' });
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/departments')
      .then(({ data }) => setDepartments(data.data || []))
      .catch(() => toast.error('Failed to load departments'))
      .finally(() => setLoading(false));
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
    const timer = setTimeout(async () => {
      if (!patientQuery.trim()) {
        setPatients([]);
        return;
      }
      try {
        const { data } = await api.get(`/patients/search?q=${encodeURIComponent(patientQuery.trim())}`);
        setPatients(data.data || []);
      } catch {
        setPatients([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [patientQuery]);

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
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    if (!form.timeSlot) {
      toast.error('Please select a time slot');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/appointments', {
        patient: selectedPatient._id,
        doctor: form.doctor,
        department: form.department,
        date: form.date,
        timeSlot: form.timeSlot,
        symptoms: form.symptoms,
        type: form.type,
      });
      toast.success('Appointment booked successfully');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Book New Appointment</h2>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Search Patient</label>
          <input
            className="input-field"
            placeholder="Name, patient ID, or phone"
            value={patientQuery}
            onChange={(e) => {
              setPatientQuery(e.target.value);
              setSelectedPatient(null);
            }}
          />
          {patients.length > 0 && !selectedPatient && (
            <div className="mt-2 border rounded-lg divide-y max-h-40 overflow-y-auto">
              {patients.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => {
                    setSelectedPatient(p);
                    setPatientQuery(`${p.firstName} ${p.lastName} (${p.patientId})`);
                    setPatients([]);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                >
                  {p.firstName} {p.lastName} — {p.patientId} — {p.phone}
                </button>
              ))}
            </div>
          )}
          {selectedPatient && (
            <p className="text-sm text-green-700 mt-1">
              Selected: {selectedPatient.firstName} {selectedPatient.lastName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Appointment Type</label>
          <select
            className="input-field"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="walk-in">Walk-in</option>
            <option value="online">Online</option>
            <option value="follow-up">Follow-up</option>
          </select>
        </div>

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
                {formatDoctorName(d.user?.name)} — LKR {d.consultationFee?.toLocaleString()}
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
          <label className="block text-sm font-medium mb-1">Symptoms / Reason</label>
          <textarea
            className="input-field"
            rows={3}
            value={form.symptoms}
            onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
            placeholder="Reason for visit"
          />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={submitting || !form.timeSlot || !selectedPatient} className="btn-primary flex-1">
            {submitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookAppointmentReception;
