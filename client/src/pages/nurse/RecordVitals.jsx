import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';

const RecordVitals = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    patient: '',
    admission: '',
    temperature: '',
    systolic: '',
    diastolic: '',
    pulse: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    bloodGlucose: '',
    notes: '',
  });

  useEffect(() => {
    api
      .get('/wards/admissions')
      .then(({ data }) => setAdmissions(data.data || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load patients'))
      .finally(() => setLoading(false));
  }, []);

  const handlePatientChange = (admissionId) => {
    const admission = admissions.find((a) => a._id === admissionId);
    setForm({
      ...form,
      admission: admissionId,
      patient: admission?.patient?._id || '',
    });
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient) {
      toast.error('Please select a patient');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient: form.patient,
        admission: form.admission || undefined,
        notes: form.notes || undefined,
      };

      if (form.temperature) payload.temperature = parseFloat(form.temperature);
      if (form.pulse) payload.pulse = parseInt(form.pulse, 10);
      if (form.respiratoryRate) payload.respiratoryRate = parseInt(form.respiratoryRate, 10);
      if (form.oxygenSaturation) payload.oxygenSaturation = parseFloat(form.oxygenSaturation);
      if (form.weight) payload.weight = parseFloat(form.weight);
      if (form.height) payload.height = parseFloat(form.height);
      if (form.bloodGlucose) payload.bloodGlucose = parseFloat(form.bloodGlucose);
      if (form.systolic && form.diastolic) {
        payload.bloodPressure = {
          systolic: parseInt(form.systolic, 10),
          diastolic: parseInt(form.diastolic, 10),
        };
      }

      await api.post('/vitals', payload);
      toast.success('Vital signs recorded successfully');
      setForm({
        patient: '',
        admission: '',
        temperature: '',
        systolic: '',
        diastolic: '',
        pulse: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        weight: '',
        height: '',
        bloodGlucose: '',
        notes: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record vitals');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Record Vital Signs</h1>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Patient</label>
          <select
            className="input-field"
            value={form.admission}
            onChange={(e) => handlePatientChange(e.target.value)}
            required
          >
            <option value="">Select admitted patient</option>
            {admissions.map((a) => (
              <option key={a._id} value={a._id}>
                {a.patient?.firstName} {a.patient?.lastName} — {a.ward?.name} Bed {a.bed?.bedNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Temperature (°C)</label>
            <input
              type="number"
              step="0.1"
              className="input-field"
              placeholder="36.5"
              value={form.temperature}
              onChange={(e) => handleChange('temperature', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pulse (bpm)</label>
            <input
              type="number"
              className="input-field"
              placeholder="72"
              value={form.pulse}
              onChange={(e) => handleChange('pulse', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Blood Pressure (mmHg)</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              className="input-field"
              placeholder="Systolic"
              value={form.systolic}
              onChange={(e) => handleChange('systolic', e.target.value)}
            />
            <input
              type="number"
              className="input-field"
              placeholder="Diastolic"
              value={form.diastolic}
              onChange={(e) => handleChange('diastolic', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Respiratory Rate (/min)</label>
            <input
              type="number"
              className="input-field"
              placeholder="16"
              value={form.respiratoryRate}
              onChange={(e) => handleChange('respiratoryRate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SpO2 (%)</label>
            <input
              type="number"
              step="0.1"
              className="input-field"
              placeholder="98"
              value={form.oxygenSaturation}
              onChange={(e) => handleChange('oxygenSaturation', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              className="input-field"
              placeholder="70"
              value={form.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Height (cm)</label>
            <input
              type="number"
              step="0.1"
              className="input-field"
              placeholder="170"
              value={form.height}
              onChange={(e) => handleChange('height', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Blood Glucose (mg/dL)</label>
          <input
            type="number"
            step="0.1"
            className="input-field"
            placeholder="100"
            value={form.bloodGlucose}
            onChange={(e) => handleChange('bloodGlucose', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="Additional observations..."
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Recording...' : 'Record Vital Signs'}
        </button>
      </form>
    </div>
  );
};

export default RecordVitals;
