import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatDoctorName } from '../../utils/helpers';

const todayStr = () => new Date().toISOString().split('T')[0];

const QueueManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/doctors')
      .then(({ data }) => setDoctors(data.data || []))
      .catch(() => toast.error('Failed to load doctors'));
  }, []);

  const loadQueue = async () => {
    if (!selectedDoctor) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/queue/doctor/${selectedDoctor}?date=${selectedDate}`);
      setQueue(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load queue');
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctor, selectedDate]);

  const callNext = async (id) => {
    try {
      await api.put(`/queue/${id}/call`);
      toast.success('Patient called');
      loadQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to call patient');
    }
  };

  const skip = async (id) => {
    try {
      await api.put(`/queue/${id}/skip`);
      toast.success('Patient skipped');
      loadQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to skip patient');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Queue Management</h1>
      <p className="text-gray-500 text-sm mb-6">
        Select a doctor and date to see patients waiting in line. Use Call to bring the next patient in.
      </p>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          className="input-field max-w-md flex-1"
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
        >
          <option value="">Select Doctor</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>{formatDoctorName(d.user?.name)}</option>
          ))}
        </select>
        <input
          type="date"
          className="input-field max-w-xs"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {!selectedDoctor ? (
        <div className="card text-center py-12 text-gray-500">Select a doctor to view their queue</div>
      ) : loading ? (
        <Loader />
      ) : queue.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          No patients in queue for this doctor on the selected date.
          <p className="text-sm mt-2">Try another date — demo appointments may be on nearby days.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((q) => (
            <div key={q._id} className="card flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">#{q.queueNumber}</p>
                <p>{q.patient?.firstName} {q.patient?.lastName}</p>
                <p className="text-xs text-gray-400">{q.patient?.patientId} · {q.patient?.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge status={q.status} />
                {q.status === 'waiting' && (
                  <>
                    <button onClick={() => callNext(q._id)} className="btn-primary text-sm">Call</button>
                    <button onClick={() => skip(q._id)} className="btn-secondary text-sm">Skip</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QueueManagement;
