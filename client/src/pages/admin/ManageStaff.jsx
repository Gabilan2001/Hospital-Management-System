import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';

const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [toggleId, setToggleId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'nurse', phone: '' });

  const fetch = () => {
    api.get('/users').then(({ data }) => {
      setStaff((data.data || []).filter((u) => u.role !== 'patient'));
      setLoading(false);
    });
  };

  useEffect(() => { fetch(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/users', form);
    toast.success('Staff added');
    setShowAdd(false);
    fetch();
  };

  const handleToggle = async () => {
    await api.put(`/users/${toggleId}/toggle`);
    toast.success('Status updated');
    fetch();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Staff</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm">Add Staff</button>
      </div>
      {showAdd && (
        <form onSubmit={handleAdd} className="card mb-6 grid grid-cols-2 gap-3">
          <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {['nurse','receptionist','lab_technician','pharmacist','billing'].map((r) => <option key={r} value={r}>{r.replace('_',' ')}</option>)}
          </select>
          <button type="submit" className="btn-primary col-span-2">Save</button>
        </form>
      )}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b"><th className="text-left py-2">Name</th><th className="text-left">Email</th><th className="text-left">Role</th><th className="text-left">Status</th><th className="text-left">Action</th></tr></thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s._id} className="border-b">
                <td className="py-2">{s.name}</td>
                <td>{s.email}</td>
                <td className="capitalize">{s.role?.replace('_', ' ')}</td>
                <td>{s.isActive ? 'Active' : 'Inactive'}</td>
                <td><button onClick={() => setToggleId(s._id)} className="text-primary-700 text-xs hover:underline">Toggle</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmModal isOpen={!!toggleId} onClose={() => setToggleId(null)} onConfirm={handleToggle} title="Toggle Status" message="Change staff active status?" />
    </div>
  );
};

export default ManageStaff;
