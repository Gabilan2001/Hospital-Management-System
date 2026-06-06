import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, UserX, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import Avatar from '../../components/common/Avatar';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatCurrency, formatDoctorName } from '../../utils/helpers';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deactivateId, setDeactivateId] = useState(null);

  const fetchDoctors = () => {
    setLoading(true);
    api.get('/doctors?all=true')
      .then(({ data }) => setDoctors(data.data || []))
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleDeactivate = async () => {
    try {
      await api.put(`/doctors/${deactivateId}/deactivate`);
      toast.success('Doctor removed from active list');
      setDeactivateId(null);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div className="page-header mb-0">
          <h1 className="page-title">Manage Doctors</h1>
          <p className="page-subtitle">Add, edit, and manage doctor profiles and login credentials</p>
        </div>
        <Link to="/admin/doctors/add" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Doctor
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {doctors.map((d) => (
          <div key={d._id} className={`card ${!d.isAvailable ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-4">
              <Avatar src={d.user?.avatar} name={d.user?.name} size="xl" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{formatDoctorName(d.user?.name)}</h3>
                <p className="text-sm text-primary-600 font-medium">{d.specialization}</p>
                <p className="text-xs text-gray-400 mt-0.5">{d.department?.name}</p>
                {!d.isAvailable && (
                  <span className="badge-pill bg-red-100 text-red-700 mt-2">Inactive</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-amber-500 shrink-0">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-semibold">{d.rating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="truncate text-gray-700">{d.user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Fee</p>
                <p className="font-medium">{formatCurrency(d.consultationFee)}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Link to={`/admin/doctors/edit/${d._id}`} className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm py-2">
                <Pencil size={14} /> Edit
              </Link>
              {d.isAvailable && (
                <button
                  type="button"
                  onClick={() => setDeactivateId(d._id)}
                  className="btn-danger flex items-center justify-center gap-1 text-sm py-2 px-3"
                >
                  <UserX size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!deactivateId}
        onClose={() => setDeactivateId(null)}
        onConfirm={handleDeactivate}
        title="Remove Doctor"
        message="This will deactivate the doctor account. They will no longer appear in booking lists."
      />
    </div>
  );
};

export default ManageDoctors;
