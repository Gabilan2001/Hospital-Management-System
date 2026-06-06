import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';

const GenerateInvoice = () => {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patient: '', items: [{ type: 'consultation', description: '', quantity: 1, unitPrice: 0, total: 0 }], discount: 0, notes: '' });

  useEffect(() => {
    api.get('/patients').then(({ data }) => setPatients(data.data));
  }, []);

  const updateItem = (i, field, value) => {
    const items = [...form.items];
    items[i][field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      items[i].total = (parseFloat(items[i].quantity) || 0) * (parseFloat(items[i].unitPrice) || 0);
    }
    setForm({ ...form, items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/billing/invoice', form);
      toast.success('Invoice generated');
      setForm({ patient: '', items: [{ type: 'consultation', description: '', quantity: 1, unitPrice: 0, total: 0 }], discount: 0, notes: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Generate Invoice</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <select className="input-field" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required>
          <option value="">Select Patient</option>
          {patients.map((p) => <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>)}
        </select>
        {form.items.map((item, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
            <select className="input-field" value={item.type} onChange={(e) => updateItem(i, 'type', e.target.value)}>
              {['consultation','lab','pharmacy','ward','procedure','other'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className="input-field" placeholder="Description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} required />
            <input type="number" className="input-field" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
            <input type="number" className="input-field" placeholder="Unit Price" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', e.target.value)} />
          </div>
        ))}
        <input type="number" className="input-field" placeholder="Discount (LKR)" value={form.discount} onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })} />
        <textarea className="input-field" rows={2} placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button type="submit" className="btn-primary w-full">Generate Invoice</button>
      </form>
    </div>
  );
};

export default GenerateInvoice;
