import { useEffect, useState } from 'react';
import { Hospital } from 'lucide-react';
import { useQueueSocket } from '../../hooks/useSocket';

const QueueDisplay = () => {
  const [display, setDisplay] = useState([]);
  const [loading, setLoading] = useState(true);

  useQueueSocket();

  const fetchDisplay = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/queue/display`);
      const data = await res.json();
      setDisplay(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisplay();
    const interval = setInterval(fetchDisplay, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-2xl animate-pulse">Loading queue...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-center gap-4 mb-8">
        <Hospital size={48} className="text-blue-400" />
        <h1 className="text-4xl font-bold">CareLink Hospital - Queue Display</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {display.map((item) => (
          <div key={item.doctor._id} className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="text-center mb-6">
              <p className="text-gray-400 text-xl">{item.doctor.department}</p>
              <h2 className="text-3xl font-bold text-blue-400">Dr. {item.doctor.name}</h2>
            </div>

            <div className="text-center mb-8">
              <p className="text-gray-400 text-lg mb-2">NOW SERVING</p>
              {item.current ? (
                <div className="bg-green-600 rounded-xl py-6 px-4">
                  <p className="text-6xl font-black">#{item.current.queueNumber}</p>
                  <p className="text-xl mt-2">{item.current.patient?.firstName} {item.current.patient?.lastName}</p>
                </div>
              ) : (
                <div className="bg-gray-700 rounded-xl py-6">
                  <p className="text-4xl text-gray-400">—</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-gray-400 text-lg mb-3 text-center">NEXT</p>
              <div className="flex justify-center gap-4">
                {item.next?.length > 0 ? (
                  item.next.map((q) => (
                    <div key={q.queueNumber} className="bg-gray-700 rounded-lg px-6 py-4 text-center">
                      <p className="text-3xl font-bold">#{q.queueNumber}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No patients waiting</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {display.length === 0 && (
        <p className="text-center text-gray-500 text-2xl mt-12">No active queues today</p>
      )}
    </div>
  );
};

export default QueueDisplay;
