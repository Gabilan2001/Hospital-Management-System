import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/helpers';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctors').then(({ data }) => {
      setDoctors(data.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Doctors</h1>
        <Link to="/admin/doctors/add" className="btn-primary text-sm">Add Doctor</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b"><th className="text-left py-2">Name</th><th className="text-left">Department</th><th className="text-left">Specialization</th><th className="text-left">Fee</th><th className="text-left">Rating</th></tr></thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d._id} className="border-b">
                <td className="py-2">Dr. {d.user?.name}</td>
                <td>{d.department?.name}</td>
                <td>{d.specialization}</td>
                <td>{formatCurrency(d.consultationFee)}</td>
                <td>{d.rating?.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageDoctors;
