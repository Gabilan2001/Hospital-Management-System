import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/helpers';

const PayBill = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api.get(`/billing/invoices/${invoiceId}`)
      .then(({ data }) => setInvoice(data.data))
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to load invoice');
      })
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const { data } = await api.post('/payment/initiate', { invoiceId });
      const payData = data.data;

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payData.payhereUrl;
      form.target = '_blank';

      const fields = {
        merchant_id: payData.merchant_id,
        return_url: payData.return_url,
        cancel_url: payData.cancel_url,
        notify_url: payData.notify_url,
        order_id: payData.order_id,
        items: payData.items,
        currency: payData.currency,
        amount: payData.amount,
        first_name: payData.first_name,
        last_name: payData.last_name,
        email: payData.email,
        phone: payData.phone,
        address: payData.address,
        city: payData.city,
        country: payData.country,
        hash: payData.hash,
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      toast.success('Redirecting to PayHere...');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <Loader />;
  if (!invoice) return <div className="card text-center py-12">Invoice not found</div>;

  const isPaid = invoice.status === 'paid';

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pay Bill</h1>

      <div className="card space-y-5">
        <div className="text-center">
          <p className="text-gray-500">Invoice</p>
          <p className="text-xl font-bold">{invoice.invoiceNumber}</p>
          <div className="flex justify-center mt-2">
            <Badge status={invoice.status} />
          </div>
          <p className="text-3xl font-bold text-primary-700 mt-3">{formatCurrency(invoice.totalAmount)}</p>
          <p className="text-sm text-gray-500 mt-1">Issued: {formatDate(invoice.createdAt)}</p>
        </div>

        {invoice.items?.length > 0 && (
          <div className="border-t pt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Invoice Items</p>
            {invoice.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.description} {item.quantity > 1 ? `(×${item.quantity})` : ''}
                </span>
                <span className="font-medium">{formatCurrency(item.total)}</span>
              </div>
            ))}
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(invoice.tax)}</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={paying || isPaid}
          className="btn-primary w-full py-3"
        >
          {paying ? 'Processing...' : isPaid ? 'Already Paid' : 'Pay with PayHere'}
        </button>

        <button onClick={() => navigate('/patient/bills')} className="btn-secondary w-full">
          Back to Bills
        </button>
      </div>
    </div>
  );
};

export default PayBill;
