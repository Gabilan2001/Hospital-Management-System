import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const OrderLabTest = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [patientId, setPatientId] = useState(searchParams.get('patient') || '');
  const [patientQuery, setPatientQuery] = useState('');
  const [priority, setPriority] = useState('normal');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [testsRes, docRes] = await Promise.all([
          api.get('/lab/tests'),
          api.get('/doctors'),
        ]);
        setCatalog(testsRes.data.data || []);

        const profile = (docRes.data.data || []).find(
          (d) => d.user?._id === user?._id || d.user === user?._id
        );
        if (profile) {
          setDoctorId(profile._id);
          const ordersRes = await api.get('/lab/orders');
          const doctorOrders = (ordersRes.data.data || []).filter(
            (o) => o.doctor?._id === profile._id || o.doctor === profile._id
          );
          setRecentOrders(doctorOrders.slice(0, 5));
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load lab data');
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!patientQuery.trim()) {
        setPatients([]);
        return;
      }
      try {
        const { data } = await api.get(`/patients/search?q=${encodeURIComponent(patientQuery.trim())}`);
        setPatients(data.data || []);
      } catch {
        setPatients([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [patientQuery]);

  const toggleTest = (testId) => {
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  const categories = [...new Set(catalog.map((t) => t.category).filter(Boolean))];
  const filteredCatalog = categoryFilter
    ? catalog.filter((t) => t.category === categoryFilter)
    : catalog;

  const totalCost = catalog
    .filter((t) => selectedTests.includes(t._id))
    .reduce((sum, t) => sum + (t.price || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      toast.error('Please select a patient');
      return;
    }
    if (!doctorId) {
      toast.error('Doctor profile not found');
      return;
    }
    if (selectedTests.length === 0) {
      toast.error('Select at least one lab test');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/lab/order', {
        patient: patientId,
        doctor: doctorId,
        tests: selectedTests,
        priority,
      });
      toast.success('Lab tests ordered successfully');
      navigate(`/doctor/patient/${patientId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to order lab tests');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Order Lab Tests</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search Patient</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search by name or patient ID..."
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
              />
            </div>
            {patients.length > 0 && (
              <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                {patients.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => {
                      setPatientId(p._id);
                      setPatientQuery(`${p.firstName} ${p.lastName} (${p.patientId})`);
                      setPatients([]);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${patientId === p._id ? 'bg-blue-50' : ''}`}
                  >
                    {p.firstName} {p.lastName} — {p.patientId}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select className="input-field" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold">Test Catalog</h2>
            {categories.length > 0 && (
              <select
                className="input-field w-auto text-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>

          {filteredCatalog.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No lab tests available in catalog</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCatalog.map((test) => (
                <label
                  key={test._id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTests.includes(test._id) ? 'border-primary-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test._id)}
                    onChange={() => toggleTest(test._id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{test.name}</p>
                    <p className="text-xs text-gray-500">{test.code} • {test.category}</p>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(test.price)}</span>
                </label>
              ))}
            </div>
          )}

          {selectedTests.length > 0 && (
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-600">{selectedTests.length} test(s) selected</p>
              <p className="font-semibold">Total: {formatCurrency(totalCost)}</p>
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting || selectedTests.length === 0} className="btn-primary w-full">
          {submitting ? 'Ordering...' : 'Order Selected Tests'}
        </button>
      </form>

      {recentOrders.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-lg font-semibold mb-4">Recent Lab Orders</h2>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <div>
                  <p className="font-medium">
                    {order.patient?.firstName} {order.patient?.lastName}
                  </p>
                  <p className="text-gray-500">{formatDateTime(order.orderedAt || order.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <Badge status={order.priority} />
                  <Badge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderLabTest;
