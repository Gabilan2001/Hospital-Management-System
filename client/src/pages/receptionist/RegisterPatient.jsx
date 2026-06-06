import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import api from '../../api/axiosInstance';
import Avatar from '../../components/common/Avatar';

const RegisterPatient = () => {
  const navigate = useNavigate();
  const photoRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'male', bloodGroup: 'O+',
    phone: '', email: '', street: '', city: 'Colombo', province: 'Western',
    ecName: '', ecPhone: '', ecRelationship: '', allergies: '',
  });

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/patients', {
        firstName: form.firstName, lastName: form.lastName,
        dateOfBirth: form.dateOfBirth, gender: form.gender, bloodGroup: form.bloodGroup,
        phone: form.phone, email: form.email,
        address: { street: form.street, city: form.city, province: form.province },
        emergencyContact: { name: form.ecName, phone: form.ecPhone, relationship: form.ecRelationship },
        allergies: form.allergies ? form.allergies.split(',').map((a) => a.trim()).filter(Boolean) : [],
      });

      if (photoFile && data.data?._id) {
        const fd = new FormData();
        fd.append('image', photoFile);
        await api.post(`/upload/patient/${data.data._id}/photo`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success('Patient registered successfully');
      navigate('/reception');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const u = (field, value) => setForm({ ...form, [field]: value });
  const fullName = `${form.firstName} ${form.lastName}`.trim();

  return (
    <div className="max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">Register Patient</h1>
        <p className="page-subtitle">Add a new patient to the hospital system</p>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="flex flex-col items-center pb-6 border-b border-gray-100">
          <div className="relative group cursor-pointer" onClick={() => photoRef.current?.click()}>
            <Avatar src={photoPreview} name={fullName || 'Patient'} size="2xl" />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
          </div>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          <p className="text-xs text-gray-400 mt-2">Optional patient photo</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input className="input-field" placeholder="First Name" value={form.firstName} onChange={(e) => u('firstName', e.target.value)} required />
          <input className="input-field" placeholder="Last Name" value={form.lastName} onChange={(e) => u('lastName', e.target.value)} required />
          <input className="input-field" type="date" value={form.dateOfBirth} onChange={(e) => u('dateOfBirth', e.target.value)} required />
          <select className="input-field" value={form.gender} onChange={(e) => u('gender', e.target.value)}>
            <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
          </select>
          <select className="input-field" value={form.bloodGroup} onChange={(e) => u('bloodGroup', e.target.value)}>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bg) => <option key={bg}>{bg}</option>)}
          </select>
          <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => u('phone', e.target.value)} required />
          <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(e) => u('email', e.target.value)} />
          <input className="input-field" placeholder="Street" value={form.street} onChange={(e) => u('street', e.target.value)} />
          <input className="input-field" placeholder="City" value={form.city} onChange={(e) => u('city', e.target.value)} />
        </div>
        <h3 className="font-medium text-sm text-gray-600">Emergency Contact</h3>
        <div className="grid grid-cols-3 gap-4">
          <input className="input-field" placeholder="Name" value={form.ecName} onChange={(e) => u('ecName', e.target.value)} />
          <input className="input-field" placeholder="Phone" value={form.ecPhone} onChange={(e) => u('ecPhone', e.target.value)} />
          <input className="input-field" placeholder="Relationship" value={form.ecRelationship} onChange={(e) => u('ecRelationship', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Known Allergies (comma separated)</label>
          <input className="input-field" placeholder="e.g. Penicillin, Peanuts" value={form.allergies} onChange={(e) => u('allergies', e.target.value)} />
        </div>
        <button type="submit" className="btn-primary w-full py-3">Register Patient</button>
      </form>
    </div>
  );
};

export default RegisterPatient;
