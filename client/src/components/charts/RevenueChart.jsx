import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/helpers';

const RevenueChart = ({ data }) => (
  <div className="card">
    <h3 className="font-semibold mb-4">Monthly Revenue</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Line type="monotone" dataKey="revenue" stroke="#1D4ED8" strokeWidth={2} dot={{ fill: '#1D4ED8' }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default RevenueChart;
