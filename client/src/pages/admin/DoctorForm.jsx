import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import AvatarUpload from '../../components/common/AvatarUpload';
import Loader from '../../components/common/Loader';

const defaultSlots = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => ({
  day, startTime: '09:00', endTime: '17:00', slotDuration: 20, maxPatients: 20,
}));

const DoctorForm = ({ editId }) => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(!!editId);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [avatar, setAvatar] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: 'Doctor@123', phone: '', department: '',
    specialization: '', qualification: '', experience: 0, licenseNumber: '', consultationFee: 1500,
  });

  useEffect(() => {
    api.get('/departments').then(({ data }) => setDepartments(data.data || []));
  }, []);

  useEffect(() => {
    if (!editId) return;
    api.get(`/doctors/${editId}`)
      .then(({ data }) => {
        const d = data.data;
        setUserId(d.user?._id);
        setAvatar(d.user?.avatar || '');
        setForm({
          name: d.user?.name || '',
          email: d.user?.email || '',
          password: '',
          phone: d.user?.phone || '',
          department: d.department?._id || d.department || '',
          specialization: d.specialization || '',
          qualification: d.qualification || '',
          experience: d.experience || 0,
          licenseNumber: d.licenseNumber || '',
          consultationFee: d.consultationFee || 1500,
        });
      })
      .catch(() => toast.error('Failed to load doctor'))
      .finally(() => setLoading(false));
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, avatar };
      if (editId && !payload.password) delete payload.password;

      if (editId) {
        await api.put(`/doctors/${editId}`, payload);
        toast.success('Doctor updated');
        navigate('/admin/doctors');
      } else {
        const { data } = await api.post('/doctors', { ...payload, availableSlots: defaultSlots });
        toast.success('Doctor added — upload photo on edit page');
        navigate(`/admin/doctors/edit/${data.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save doctor');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl">
      <Link to="/admin/doctors" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Doctors
      </Link>
      <div className="page-header">
        <h1 className="page-title">{editId ? 'Edit Doctor' : 'Add Doctor'}</h1>
        <p className="page-subtitle">Manage doctor profile, login credentials, and department</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="flex flex-col items-center pb-6 border-b border-gray-100">
          <AvatarUpload
            src={avatar}
            name={form.name}
            size="2xl"
            userId={userId}
            onUploaded={(url) => setAvatar(url)}
            disabled={!editId && !userId}
          />
          <p className="text-xs text-gray-400 mt-3">
            {editId ? 'Click to change photo' : 'Photo can be uploaded after saving'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email (Login)</label>
            <input className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{editId ? 'New Password (optional)' : 'Password'}</label>
            <input className="input-field" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editId ? 'Leave blank to keep current' : 'Doctor@123'} {...(!editId && { required: true })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required>
              <option value="">Select Department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Specialization</label>
            <input className="input-field" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Qualification</label>
            <input className="input-field" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">License Number</label>
            <input className="input-field" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Experience (years)</label>
            <input type="number" className="input-field" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Consultation Fee (LKR)</label>
            <input type="number" className="input-field" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
          {submitting ? 'Saving...' : editId ? 'Update Doctor' : 'Add Doctor'}
        </button>
      </form>
    </div>
  );
};

export const AddDoctor = () => <DoctorForm />;
export const EditDoctor = () => {
  const { id } = useParams();
  return <DoctorForm editId={id} />;
};

export default DoctorForm;
