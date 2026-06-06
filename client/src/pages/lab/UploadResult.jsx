import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';

const UploadResult = () => {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState('');
  const [results, setResults] = useState([{ value: '', unit: '', normalRange: '', notes: '' }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/lab/orders?status=processing').then(({ data }) => {
      setOrders(data.data || []);
      setLoading(false);
    });
  }, []);

  const handleUpload = async () => {
    try {
      await api.put(`/lab/${selected}/result`, { results });
      await api.put(`/lab/${selected}/complete`);
      toast.success('Results uploaded and patient notified');
      setSelected('');
      setResults([{ value: '', unit: '', normalRange: '', notes: '' }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Upload Results</h1>
      <div className="card space-y-4">
        <select className="input-field" value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Select Order</option>
          {orders.map((o) => (
            <option key={o._id} value={o._id}>{o.patient?.firstName} - {o.tests?.map((t) => t.name).join(', ')}</option>
          ))}
        </select>
        {results.map((r, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
            <input className="input-field" placeholder="Value" value={r.value} onChange={(e) => { const u = [...results]; u[i].value = e.target.value; setResults(u); }} />
            <input className="input-field" placeholder="Unit" value={r.unit} onChange={(e) => { const u = [...results]; u[i].unit = e.target.value; setResults(u); }} />
            <input className="input-field" placeholder="Normal Range" value={r.normalRange} onChange={(e) => { const u = [...results]; u[i].normalRange = e.target.value; setResults(u); }} />
            <input className="input-field" placeholder="Notes" value={r.notes} onChange={(e) => { const u = [...results]; u[i].notes = e.target.value; setResults(u); }} />
          </div>
        ))}
        <button onClick={handleUpload} disabled={!selected} className="btn-primary w-full">Upload & Notify Patient</button>
      </div>
    </div>
  );
};

export default UploadResult;
