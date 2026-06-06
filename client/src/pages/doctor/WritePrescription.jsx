import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/helpers';

const emptyMedicine = { medicine: '', medicineName: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' };

const WritePrescription = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [patientId, setPatientId] = useState(searchParams.get('patient') || '');
  const [patientQuery, setPatientQuery] = useState('');
  const [items, setItems] = useState([{ ...emptyMedicine }]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [medRes, docRes] = await Promise.all([
          api.get('/pharmacy/medicines'),
          api.get('/doctors'),
        ]);
        setMedicines(medRes.data.data || []);
        const profile = (docRes.data.data || []).find(
          (d) => d.user?._id === user?._id || d.user === user?._id
        );
        if (profile) setDoctorId(profile._id);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

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

  const addItem = () => setItems([...items, { ...emptyMedicine }]);

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'medicine') {
      const med = medicines.find((m) => m._id === value);
      if (med) {
        updated[index].medicineName = med.name;
        updated[index].dosage = med.unit ? `1 ${med.unit}` : '';
      }
    }
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      toast.error('Please select a patient');
      return;
    }
    if (!doctorId) {
      toast.error('Doctor profile not found');
      return;
    }

    const validItems = items.filter((item) => item.medicine || item.medicineName);
    if (validItems.length === 0) {
      toast.error('Add at least one medicine');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/prescriptions', {
        patient: patientId,
        doctor: doctorId,
        medicines: validItems,
        notes,
      });
      toast.success('Prescription created successfully');
      navigate(`/doctor/patient/${patientId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Write Prescription</h1>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Search Patient</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search by name or patient ID..."
              value={patientQuery}
              onChange={(e) => setPatientQuery(e.target.value)}
            />
          </div>
          {patients.length > 0 && (
            <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
              {patients.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => {
                    setPatientId(p._id);
                    setPatientQuery(`${p.firstName} ${p.lastName} (${p.patientId})`);
                    setPatients([]);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${patientId === p._id ? 'bg-blue-50' : ''}`}
                >
                  {p.firstName} {p.lastName} — {p.patientId}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Medicines</label>
            <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-primary-700 hover:underline">
              <Plus size={16} /> Add Medicine
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Medicine #{index + 1}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <select
                  className="input-field"
                  value={item.medicine}
                  onChange={(e) => updateItem(index, 'medicine', e.target.value)}
                  required
                >
                  <option value="">Select Medicine</option>
                  {medicines.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.genericName}) — {formatCurrency(m.price)}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="input-field"
                    placeholder="Dosage (e.g. 1 tablet)"
                    value={item.dosage}
                    onChange={(e) => updateItem(index, 'dosage', e.target.value)}
                    required
                  />
                  <input
                    className="input-field"
                    placeholder="Frequency (e.g. twice daily)"
                    value={item.frequency}
                    onChange={(e) => updateItem(index, 'frequency', e.target.value)}
                    required
                  />
                  <input
                    className="input-field"
                    placeholder="Duration (e.g. 7 days)"
                    value={item.duration}
                    onChange={(e) => updateItem(index, 'duration', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    className="input-field"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                    required
                  />
                </div>
                <input
                  className="input-field"
                  placeholder="Instructions (optional)"
                  value={item.instructions}
                  onChange={(e) => updateItem(index, 'instructions', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            className="input-field"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes for the pharmacist..."
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating Prescription...' : 'Create Prescription'}
        </button>
      </form>
    </div>
  );
};

export default WritePrescription;
