import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/helpers';

const MedicineInventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', genericName: '', brand: '', category: '', price: '', stock: '', unit: 'tablet', barcode: '' });

  const fetch = () => {
    api.get('/pharmacy/medicines').then(({ data }) => {
      setMedicines(data.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetch(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/pharmacy/medicines', { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) });
    toast.success('Medicine added');
    setShowAdd(false);
    fetch();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Medicine Inventory</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm">Add Medicine</button>
      </div>
      {showAdd && (
        <form onSubmit={handleAdd} className="card mb-6 grid grid-cols-2 gap-3">
          <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field" placeholder="Generic Name" value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })} />
          <input className="input-field" placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <input className="input-field" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className="input-field" type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <input className="input-field" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
          <input className="input-field" placeholder="Barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
          <button type="submit" className="btn-primary">Save</button>
        </form>
      )}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b"><th className="text-left py-2">Name</th><th className="text-left">Stock</th><th className="text-left">Price</th><th className="text-left">Category</th></tr></thead>
          <tbody>
            {medicines.map((m) => (
              <tr key={m._id} className="border-b">
                <td className="py-2">{m.name}</td>
                <td className={m.stock <= m.lowStockThreshold ? 'text-red-600 font-bold' : ''}>{m.stock}</td>
                <td>{formatCurrency(m.price)}</td>
                <td>{m.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicineInventory;
