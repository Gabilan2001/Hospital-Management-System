import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hospital, Eye, EyeOff, Shield, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { getRoleDashboard } from '../utils/helpers';
import Loader from '../components/common/Loader';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, user, loading, initializing, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initializing && isAuthenticated && user) {
      navigate(getRoleDashboard(user.role), { replace: true });
    }
  }, [initializing, isAuthenticated, user, navigate]);

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

  if (initializing) return <Loader fullScreen />;

  return (
    <div className="min-h-screen flex bg-slate-900">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <div className="p-4 bg-white/10 rounded-2xl w-fit mb-8 backdrop-blur-sm">
            <Hospital size={48} />
          </div>
          <h1 className="text-5xl font-bold mb-4 tracking-tight">CareLink Hospital</h1>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed mb-10">
            Complete Hospital Management System for Sri Lanka. Appointments, patients, lab, pharmacy & billing — all in one place.
          </p>
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-blue-100">
              <Shield size={20} />
              <span className="text-sm">Secure & HIPAA-ready</span>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <HeartPulse size={20} />
              <span className="text-sm">24/7 Patient Care</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary-100 rounded-xl">
              <Hospital size={28} className="text-primary-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CareLink Hospital</h1>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-500 mb-8">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <div className="mt-6 p-5 bg-white rounded-2xl border border-gray-100 text-xs text-gray-500 shadow-sm">
            <p className="font-semibold text-gray-700 mb-2">Demo Credentials</p>
            <div className="space-y-1">
              <p>Admin: admin@hospital.lk / Admin@123</p>
              <p>Doctor: dr.perera@hospital.lk / Doctor@123</p>
              <p>Reception: reception@hospital.lk / Reception@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
