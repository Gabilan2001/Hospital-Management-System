import { useEffect, useState } from 'react';
import { User, Phone, Mail, MapPin, Droplets, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { useAuthUser } from '../../hooks/useAuth';
import { resolvePatientIdFromUser } from '../../utils/patientHelpers';
import Loader from '../../components/common/Loader';
import QRCodeDisplay from '../../components/common/QRCodeDisplay';
import { formatDate } from '../../utils/helpers';

const PatientProfile = () => {
  const user = useAuthUser();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const patientId = await resolvePatientIdFromUser(api, user);
        if (!patientId) {
          toast.error('Patient profile not found');
          return;
        }

        const { data: patientData } = await api.get(`/patients/${patientId}`);
        setPatient(patientData.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <Loader />;
  if (!patient) {
    return (
      <div className="card text-center py-12">
        <User size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Patient profile not found</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card flex flex-col items-center">
          <QRCodeDisplay qrCode={patient.qrCode} patientId={patient.patientId} size={200} />
          <p className="text-sm text-gray-500 mt-4 text-center">
            Show this QR code at reception for quick check-in
          </p>
        </div>

        <div className="lg:col-span-2 card">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center">
              <User size={32} className="text-sky-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{patient.firstName} {patient.lastName}</h2>
              <p className="text-sm text-gray-500 font-mono">{patient.patientId}</p>
              {user && <p className="text-sm text-gray-500">{user.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium">{patient.phone}</p>
              </div>
            </div>

            {patient.email && (
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{patient.email}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <User size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date of Birth</p>
                <p className="text-sm font-medium">{formatDate(patient.dateOfBirth)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="text-sm font-medium capitalize">{patient.gender}</p>
              </div>
            </div>

            {patient.bloodGroup && (
              <div className="flex items-center gap-3">
                <Droplets size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Blood Group</p>
                  <p className="text-sm font-medium">{patient.bloodGroup}</p>
                </div>
              </div>
            )}

            {patient.address?.city && (
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium">
                    {[patient.address.street, patient.address.city, patient.address.province]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {patient.emergencyContact?.name && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm font-medium mb-2">Emergency Contact</p>
              <p className="text-sm text-gray-600">
                {patient.emergencyContact.name} ({patient.emergencyContact.relationship}) — {patient.emergencyContact.phone}
              </p>
            </div>
          )}

          {patient.allergies?.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={16} className="text-red-600" />
                <p className="text-sm font-medium text-red-800">Allergies</p>
              </div>
              <p className="text-sm text-red-700">{patient.allergies.join(', ')}</p>
            </div>
          )}

          {patient.chronicConditions?.length > 0 && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-800 mb-1">Chronic Conditions</p>
              <p className="text-sm text-orange-700">{patient.chronicConditions.join(', ')}</p>
            </div>
          )}

          {patient.insuranceInfo?.provider && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-1">Insurance</p>
              <p className="text-sm text-gray-600">
                {patient.insuranceInfo.provider}
                {patient.insuranceInfo.policyNumber && ` — Policy: ${patient.insuranceInfo.policyNumber}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
