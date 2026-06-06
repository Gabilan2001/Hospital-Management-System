import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { roleLabels } from '../../utils/helpers';
import { User, Mail, Phone, Shield } from 'lucide-react';

const NurseProfile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="card text-center py-12 text-gray-500">Profile not available</div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Nurse Profile</h1>

      <div className="card">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-3xl font-bold text-green-700">
            {user.name?.charAt(0) || 'N'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-green-700 font-medium">{roleLabels.nurse}</p>
            <p className="text-sm text-gray-500 mt-1">CareLink Hospital</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="text-sm">{user.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Shield size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Role</p>
              <p className="text-sm capitalize">{user.role?.replace(/_/g, ' ')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Account Status</p>
              <p className="text-sm">{user.isActive !== false ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="font-semibold mb-3">Quick Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Link to="/nurse/ward-patients" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            View Ward Patients
          </Link>
          <Link to="/nurse/vitals" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            Record Vital Signs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NurseProfile;
