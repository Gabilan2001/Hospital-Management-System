import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import QRCodeDisplay from '../../components/common/QRCodeDisplay';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const search = (q) => {
    setLoading(true);
    const url = q ? `/patients/search?q=${q}` : '/patients';
    api.get(url).then(({ data }) => {
      setPatients(data.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { search(''); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Patients</h1>
      <div className="relative mb-6 max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input-field pl-10" placeholder="Search patients..." onChange={(e) => search(e.target.value)} />
      </div>
      {loading ? <Loader /> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-2">ID</th><th className="text-left">Name</th><th className="text-left">Phone</th><th className="text-left">Blood</th></tr></thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id} className="border-b cursor-pointer hover:bg-gray-50" onClick={() => setSelected(p)}>
                    <td className="py-2">{p.patientId}</td>
                    <td>{p.firstName} {p.lastName}</td>
                    <td>{p.phone}</td>
                    <td>{p.bloodGroup}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selected && (
            <div className="card">
              <h3 className="font-semibold mb-4">{selected.firstName} {selected.lastName}</h3>
              <QRCodeDisplay qrCode={selected.qrCode} patientId={selected.patientId} size={150} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManagePatients;
