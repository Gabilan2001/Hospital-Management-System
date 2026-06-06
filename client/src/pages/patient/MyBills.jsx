import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { useAuthUser } from '../../hooks/useAuth';
import { resolvePatientIdFromUser } from '../../utils/patientHelpers';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/helpers';

const MyBills = () => {
  const user = useAuthUser();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const patientId = await resolvePatientIdFromUser(api, user);
        if (!patientId) {
          toast.error('Patient profile not found');
          return;
        }
        const { data } = await api.get(`/billing/invoices/patient/${patientId}`);
        setInvoices(data.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Bills</h1>

      {invoices.length === 0 ? (
        <div className="card text-center py-12">
          <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No invoices found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div key={inv._id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-lg">{inv.invoiceNumber}</p>
                  <p className="text-sm text-gray-500">{formatDate(inv.createdAt)}</p>
                  {inv.dueDate && (
                    <p className="text-sm text-gray-500">Due: {formatDate(inv.dueDate)}</p>
                  )}
                  <p className="text-xl font-bold text-primary-700 mt-2">{formatCurrency(inv.totalAmount)}</p>
                  {inv.items?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {inv.items.slice(0, 3).map((item, i) => (
                        <p key={i} className="text-xs text-gray-500">
                          {item.description} — {formatCurrency(item.total)}
                        </p>
                      ))}
                      {inv.items.length > 3 && (
                        <p className="text-xs text-gray-400">+{inv.items.length - 3} more items</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <Badge status={inv.status} />
                  {(inv.status === 'pending' || inv.status === 'partial') && (
                    <Link to={`/patient/pay/${inv._id}`} className="btn-primary text-sm">
                      Pay Online
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBills;
