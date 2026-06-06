import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const OccupancyChart = ({ data }) => (
  <div className="card">
    <h3 className="font-semibold mb-4">Bed Occupancy by Ward</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="ward" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="occupied" fill="#EF4444" name="Occupied" radius={[4, 4, 0, 0]} />
        <Bar dataKey="available" fill="#22C55E" name="Available" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default OccupancyChart;
