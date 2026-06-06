import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';

const DispenseMedicine = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({ prescription: '', patient: '', items: [{ medicine: '', quantity: 1 }] });

  useEffect(() => {
    api.get('/prescriptions/pharmacy/queue').then(({ data }) => setPrescriptions(data.data));
    api.get('/pharmacy/medicines').then(({ data }) => setMedicines(data.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pharmacy/dispense', form);
      toast.success('Medicine dispensed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Dispense failed');
    }
  };

  const selectRx = (rxId) => {
    const rx = prescriptions.find((r) => r._id === rxId);
    if (rx) {
      setForm({
        prescription: rxId,
        patient: rx.patient._id,
        items: rx.medicines.map((m) => ({ medicine: m.medicine?._id || m.medicine, quantity: m.quantity })),
      });
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Dispense Medicine</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <select className="input-field" onChange={(e) => selectRx(e.target.value)} required>
          <option value="">Select Prescription</option>
          {prescriptions.map((rx) => (
            <option key={rx._id} value={rx._id}>{rx.patient?.firstName} {rx.patient?.lastName}</option>
          ))}
        </select>
        {form.items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <select className="input-field flex-1" value={item.medicine} onChange={(e) => { const u = [...form.items]; u[i].medicine = e.target.value; setForm({ ...form, items: u }); }} required>
              <option value="">Medicine</option>
              {medicines.map((m) => <option key={m._id} value={m._id}>{m.name} (Stock: {m.stock})</option>)}
            </select>
            <input type="number" className="input-field w-24" value={item.quantity} onChange={(e) => { const u = [...form.items]; u[i].quantity = parseInt(e.target.value); setForm({ ...form, items: u }); }} min={1} />
          </div>
        ))}
        <button type="submit" className="btn-primary w-full">Dispense</button>
      </form>
    </div>
  );
};

export default DispenseMedicine;
