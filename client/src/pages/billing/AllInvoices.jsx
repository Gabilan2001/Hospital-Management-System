import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/helpers';

const AllInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = filter ? `/billing/invoices?status=${filter}` : '/billing/invoices';
    api.get(url).then(({ data }) => {
      setInvoices(data.data || []);
      setLoading(false);
    });
  }, [filter]);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Invoices</h1>
        <select className="input-field w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b"><th className="text-left py-2">Invoice</th><th className="text-left">Patient</th><th className="text-left">Amount</th><th className="text-left">Date</th><th className="text-left">Status</th></tr></thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id} className="border-b">
                <td className="py-2">{inv.invoiceNumber}</td>
                <td>{inv.patient?.firstName} {inv.patient?.lastName}</td>
                <td>{formatCurrency(inv.totalAmount)}</td>
                <td>{formatDate(inv.createdAt)}</td>
                <td><Badge status={inv.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllInvoices;
