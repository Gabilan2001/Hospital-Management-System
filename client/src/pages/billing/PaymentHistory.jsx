import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/helpers';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/billing/payments').then(({ data }) => {
      setPayments(data.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b"><th className="text-left py-2">Invoice</th><th className="text-left">Patient</th><th className="text-left">Amount</th><th className="text-left">Method</th><th className="text-left">Date</th><th className="text-left">Status</th></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-b">
                <td className="py-2">{p.invoice?.invoiceNumber}</td>
                <td>{p.patient?.firstName} {p.patient?.lastName}</td>
                <td>{formatCurrency(p.amount)}</td>
                <td className="capitalize">{p.paymentMethod}</td>
                <td>{formatDate(p.paidAt || p.createdAt)}</td>
                <td><Badge status={p.paymentStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
