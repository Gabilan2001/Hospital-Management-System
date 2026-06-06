import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [showAdd, setShowAdd] = useState(false);

  const fetch = () => {
    api.get('/departments').then(({ data }) => {
      setDepartments(data.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetch(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/departments', form);
    toast.success('Department added');
    setShowAdd(false);
    fetch();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm">Add Department</button>
      </div>
      {showAdd && (
        <form onSubmit={handleAdd} className="card mb-6 flex gap-3">
          <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button type="submit" className="btn-primary">Save</button>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((d) => (
          <div key={d._id} className="card">
            <h3 className="font-semibold">{d.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{d.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageDepartments;
