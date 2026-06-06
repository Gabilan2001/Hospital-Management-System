import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';

const ManageWards = () => {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'general', floor: 1, description: '' });

  const fetch = () => {
    api.get('/wards').then(({ data }) => {
      setWards(data.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetch(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/wards', form);
    toast.success('Ward created');
    setShowAdd(false);
    fetch();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Wards</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm">Add Ward</button>
      </div>
      {showAdd && (
        <form onSubmit={handleAdd} className="card mb-6 grid grid-cols-2 gap-3">
          <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {['general','icu','emergency','maternity','pediatric','private'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="number" className="input-field" placeholder="Floor" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
          <input className="input-field" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button type="submit" className="btn-primary col-span-2">Save</button>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wards.map((w) => (
          <div key={w._id} className="card">
            <h3 className="font-semibold">{w.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{w.type} | Floor {w.floor}</p>
            <p className="text-sm mt-2"><span className="text-green-600 font-medium">{w.availableBeds}</span> / {w.totalBeds} beds available</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageWards;
