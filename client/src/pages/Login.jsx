import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hospital, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { getRoleDashboard } from '../utils/helpers';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, user, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleDashboard(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login({ email, password });
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Login successful');
      navigate(getRoleDashboard(result.payload.role), { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary-700 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <Hospital size={64} className="mb-6" />
          <h1 className="text-4xl font-bold mb-4">CareLink Hospital</h1>
          <p className="text-blue-100 text-lg">
            Complete Hospital Management System for Sri Lanka. Manage appointments, patients, wards, lab, pharmacy and billing in one place.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Hospital size={32} className="text-primary-700" />
            <h1 className="text-2xl font-bold text-primary-700">CareLink Hospital</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@hospital.lk"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
            <p className="font-medium mb-2">Demo Credentials:</p>
            <p>Admin: admin@hospital.lk / Admin@123</p>
            <p>Doctor: dr.perera@hospital.lk / Doctor@123</p>
            <p>Reception: reception@hospital.lk / Reception@123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
