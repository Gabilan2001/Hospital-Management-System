import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';

const RegisterPatient = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'male', bloodGroup: 'O+',
    phone: '', email: '', street: '', city: 'Colombo', province: 'Western',
    ecName: '', ecPhone: '', ecRelationship: '', allergies: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patients', {
        firstName: form.firstName, lastName: form.lastName,
        dateOfBirth: form.dateOfBirth, gender: form.gender, bloodGroup: form.bloodGroup,
        phone: form.phone, email: form.email,
        address: { street: form.street, city: form.city, province: form.province },
        emergencyContact: { name: form.ecName, phone: form.ecPhone, relationship: form.ecRelationship },
        allergies: form.allergies ? form.allergies.split(',').map((a) => a.trim()).filter(Boolean) : [],
      });
      toast.success('Patient registered successfully');
      navigate('/reception');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const u = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Register Patient</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
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
        <button type="submit" className="btn-primary w-full">Register Patient</button>
      </form>
    </div>
  );
};

export default RegisterPatient;
