import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/helpers';
import exportToExcel from '../../utils/exportExcel';

const AdminReports = () => {
  const [revenue, setRevenue] = useState(null);
  const [patients, setPatients] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const fetchReports = () => {
    setLoading(true);
    Promise.all([
      api.get(`/reports/revenue?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
      api.get('/reports/patients'),
    ]).then(([rev, pat]) => {
      setRevenue(rev.data.data);
      setPatients(pat.data.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchReports(); }, []);

  const exportRevenue = () => {
    if (revenue?.payments) {
      exportToExcel(revenue.payments.map((p) => ({
        Patient: `${p.patient?.firstName} ${p.patient?.lastName}`,
        Amount: p.amount,
        Method: p.paymentMethod,
        Date: p.paidAt,
      })), 'revenue-report');
      toast.success('Exported');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="flex gap-3 mb-6">
        <input type="date" className="input-field w-auto" value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} />
        <input type="date" className="input-field w-auto" value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} />
        <button onClick={fetchReports} className="btn-primary text-sm">Apply</button>
        <button onClick={exportRevenue} className="btn-secondary text-sm">Export Excel</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-3">Revenue Report</h3>
          <p className="text-3xl font-bold text-primary-700">{formatCurrency(revenue?.totalRevenue)}</p>
          <p className="text-sm text-gray-500 mt-1">{revenue?.payments?.length || 0} payments</p>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3">Patient Report</h3>
          <p className="text-3xl font-bold text-primary-700">{patients?.total || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total registered patients</p>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
