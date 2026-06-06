import { useEffect, useState } from 'react';
import { Star, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/helpers';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorProfile = () => {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/doctors');
        const profile = (data.data || []).find(
          (d) => d.user?._id === user?._id || d.user === user?._id
        );
        if (profile) {
          setDoctor(profile);
          setSlots(profile.availableSlots?.length ? profile.availableSlots : []);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  const updateSlot = (index, field, value) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const addSlot = () => {
    setSlots([...slots, { day: 'Monday', startTime: '09:00', endTime: '17:00', slotDuration: 20, maxPatients: 20 }]);
  };

  const removeSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSaveAvailability = async () => {
    if (!doctor) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/doctors/${doctor._id}/availability`, { availableSlots: slots });
      setDoctor(data.data);
      toast.success('Availability updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  if (!doctor) {
    return (
      <div className="card text-center py-12 text-gray-500">Doctor profile not found</div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Doctor Profile</h1>

      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
            {doctor.user?.name?.charAt(0) || 'D'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{doctor.user?.name}</h2>
            <p className="text-gray-500">{doctor.doctorId}</p>
            <p className="text-sm text-primary-700 mt-1">{doctor.specialization}</p>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={18} fill="currentColor" />
            <span className="font-semibold">{doctor.rating?.toFixed(1) || '0.0'}</span>
            <span className="text-xs text-gray-400">({doctor.totalRatings || 0})</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-sm">
          <div>
            <p className="text-xs text-gray-400">Department</p>
            <p>{doctor.department?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Qualification</p>
            <p>{doctor.qualification}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Experience</p>
            <p>{doctor.experience} years</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">License</p>
            <p>{doctor.licenseNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Consultation Fee</p>
            <p>{formatCurrency(doctor.consultationFee)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Email</p>
            <p>{doctor.user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Phone</p>
            <p>{doctor.user?.phone || '—'}</p>
          </div>
        </div>

        {doctor.bio && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-400 mb-1">Bio</p>
            <p className="text-sm text-gray-600">{doctor.bio}</p>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Availability Schedule</h2>
          <button type="button" onClick={addSlot} className="text-sm text-primary-700 hover:underline">
            Add Slot
          </button>
        </div>

        {slots.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No availability slots configured</p>
        ) : (
          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div key={index} className="grid grid-cols-2 md:grid-cols-6 gap-3 p-3 bg-gray-50 rounded-lg items-end">
                <div>
                  <label className="text-xs text-gray-400">Day</label>
                  <select
                    className="input-field text-sm"
                    value={slot.day}
                    onChange={(e) => updateSlot(index, 'day', e.target.value)}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Start</label>
                  <input
                    type="time"
                    className="input-field text-sm"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">End</label>
                  <input
                    type="time"
                    className="input-field text-sm"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Duration (min)</label>
                  <input
                    type="number"
                    min="10"
                    className="input-field text-sm"
                    value={slot.slotDuration || 20}
                    onChange={(e) => updateSlot(index, 'slotDuration', parseInt(e.target.value, 10))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Max Patients</label>
                  <input
                    type="number"
                    min="1"
                    className="input-field text-sm"
                    value={slot.maxPatients || 20}
                    onChange={(e) => updateSlot(index, 'maxPatients', parseInt(e.target.value, 10))}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSlot(index)}
                  className="text-red-500 text-sm hover:text-red-700 py-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSaveAvailability}
          disabled={saving}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  );
};

export default DoctorProfile;
