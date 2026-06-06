import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';

const AddDoctor = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', password: 'Doctor@123', phone: '', department: '',
    specialization: '', qualification: '', experience: 0, licenseNumber: '', consultationFee: 1500,
  });

  useEffect(() => {
    api.get('/departments').then(({ data }) => setDepartments(data.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/doctors', {
        ...form,
        availableSlots: ['Monday','Tuesday','Wednesday','Thursday','Friday'].map((day) => ({
          day, startTime: '09:00', endTime: '17:00', slotDuration: 20, maxPatients: 20,
        })),
      });
      toast.success('Doctor added');
      navigate('/admin/doctors');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add Doctor</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input className="input-field" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <select className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required>
            <option value="">Department</option>
            {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <input className="input-field" placeholder="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required />
          <input className="input-field" placeholder="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} required />
          <input className="input-field" placeholder="License Number" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required />
          <input type="number" className="input-field" placeholder="Consultation Fee" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} />
        </div>
        <button type="submit" className="btn-primary w-full">Add Doctor</button>
      </form>
    </div>
  );
};

export default AddDoctor;
