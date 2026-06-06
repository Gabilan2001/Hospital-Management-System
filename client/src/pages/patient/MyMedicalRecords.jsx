import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { useAuthUser } from '../../hooks/useAuth';
import { resolvePatientIdFromUser } from '../../utils/patientHelpers';
import Loader from '../../components/common/Loader';
import { formatDate } from '../../utils/helpers';

const MyMedicalRecords = () => {
  const user = useAuthUser();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const patientId = await resolvePatientIdFromUser(api, user);
        if (!patientId) {
          toast.error('Patient profile not found');
          return;
        }
        const { data } = await api.get(`/medical-records/patient/${patientId}`);
        setRecords(data.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load medical records');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Medical Records</h1>

      {records.length === 0 ? (
        <div className="card text-center py-12">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No medical records found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <div key={r._id} className="card">
              <div className="flex flex-wrap justify-between gap-2 mb-3">
                <p className="font-semibold">Dr. {r.doctor?.user?.name || 'N/A'}</p>
                <p className="text-sm text-gray-500">{formatDate(r.visitDate)}</p>
              </div>

              {r.chiefComplaint && (
                <p className="text-sm mb-2">
                  <span className="font-medium">Chief Complaint:</span> {r.chiefComplaint}
                </p>
              )}
              {r.diagnosis && (
                <p className="text-sm">
                  <span className="font-medium">Diagnosis:</span> {r.diagnosis}
                </p>
              )}
              {r.treatmentPlan && (
                <p className="text-sm mt-1">
                  <span className="font-medium">Treatment Plan:</span> {r.treatmentPlan}
                </p>
              )}
              {r.physicalExamination && (
                <p className="text-sm mt-1 text-gray-600">
                  <span className="font-medium">Examination:</span> {r.physicalExamination}
                </p>
              )}
              {r.notes && (
                <p className="text-sm mt-2 text-gray-600 border-t pt-2">{r.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMedicalRecords;
