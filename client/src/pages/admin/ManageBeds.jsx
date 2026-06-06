import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import BedMap from '../../components/ward/BedMap';
import Loader from '../../components/common/Loader';

const ManageBeds = () => {
  const [bedMap, setBedMap] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ward: '', bedNumber: '', type: 'general', pricePerDay: 2500 });

  useEffect(() => {
    Promise.all([
      api.get('/wards/bed-map'),
      api.get('/wards'),
    ]).then(([bm, w]) => {
      setBedMap(bm.data.data || []);
      setWards(w.data.data || []);
      setLoading(false);
    });
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/wards/beds', { ...form, pricePerDay: parseFloat(form.pricePerDay) });
    toast.success('Bed added');
    const { data } = await api.get('/wards/bed-map');
    setBedMap(data.data);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bed Management</h1>
      <form onSubmit={handleAdd} className="card mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <select className="input-field" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} required>
          <option value="">Ward</option>
          {wards.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
        </select>
        <input className="input-field" placeholder="Bed Number" value={form.bedNumber} onChange={(e) => setForm({ ...form, bedNumber: e.target.value })} required />
        <input type="number" className="input-field" placeholder="Price/Day" value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} />
        <button type="submit" className="btn-primary">Add Bed</button>
      </form>
      <BedMap bedMap={bedMap} />
    </div>
  );
};

export default ManageBeds;
