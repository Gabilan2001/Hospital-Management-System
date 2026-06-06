import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pill, FlaskConical, Activity, FileText, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/helpers';

const TABS = [
  { id: 'records', label: 'Medical Records', icon: FileText },
  { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { id: 'lab', label: 'Lab Results', icon: FlaskConical },
  { id: 'vitals', label: 'Vital Signs', icon: Activity },
];

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [activeTab, setActiveTab] = useState('records');
  const [loading, setLoading] = useState(true);
  const [editingAllergies, setEditingAllergies] = useState(false);
  const [allergies, setAllergies] = useState([]);
  const [chronicConditions, setChronicConditions] = useState([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [savingClinical, setSavingClinical] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [patientRes, recordsRes, rxRes, labRes, vitalsRes] = await Promise.all([
          api.get(`/patients/${id}`),
          api.get(`/medical-records/patient/${id}`),
          api.get(`/prescriptions/patient/${id}`),
          api.get(`/lab/patient/${id}`),
          api.get(`/vitals/patient/${id}`),
        ]);
        setPatient(patientRes.data.data);
        setAllergies(patientRes.data.data.allergies || []);
        setChronicConditions(patientRes.data.data.chronicConditions || []);
        setRecords(recordsRes.data.data || []);
        setPrescriptions(rxRes.data.data || []);
        setLabResults(labRes.data.data || []);
        setVitals(vitalsRes.data.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const addAllergy = () => {
    const value = newAllergy.trim();
    if (!value) return;
    if (!allergies.includes(value)) setAllergies([...allergies, value]);
    setNewAllergy('');
  };

  const removeAllergy = (item) => setAllergies(allergies.filter((a) => a !== item));

  const addCondition = () => {
    const value = newCondition.trim();
    if (!value) return;
    if (!chronicConditions.includes(value)) setChronicConditions([...chronicConditions, value]);
    setNewCondition('');
  };

  const removeCondition = (item) => setChronicConditions(chronicConditions.filter((c) => c !== item));

  const saveClinicalInfo = async () => {
    setSavingClinical(true);
    try {
      const { data } = await api.put(`/patients/${id}`, { allergies, chronicConditions });
      setPatient(data.data);
      setEditingAllergies(false);
      toast.success('Patient clinical info updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update patient');
    } finally {
      setSavingClinical(false);
    }
  };

  if (loading) return <Loader />;
  if (!patient) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 mb-4">Patient not found</p>
        <Link to="/doctor/patients" className="btn-primary">Back to Patients</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/doctor/patients" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Patients
      </Link>

      <div className="card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-gray-500">{patient.patientId}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/doctor/prescription?patient=${id}`} className="btn-primary text-sm">Write Prescription</Link>
            <Link to={`/doctor/lab-order?patient=${id}`} className="btn-secondary text-sm">Order Lab Test</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
          <div>
            <p className="text-xs text-gray-400">Gender</p>
            <p className="capitalize">{patient.gender}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Blood Group</p>
            <p>{patient.bloodGroup || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Phone</p>
            <p>{patient.phone}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Date of Birth</p>
            <p>{formatDate(patient.dateOfBirth)}</p>
          </div>
          {patient.chronicConditions?.length > 0 && !editingAllergies && (
            <div className="col-span-2 md:col-span-4">
              <p className="text-xs text-gray-400">Chronic Conditions</p>
              <p>{patient.chronicConditions.join(', ')}</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-red-700">Allergies & Chronic Conditions</h3>
            {!editingAllergies ? (
              <button type="button" onClick={() => setEditingAllergies(true)} className="btn-secondary text-sm">
                {patient.allergies?.length ? 'Edit' : 'Add Allergies'}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAllergies(false);
                    setAllergies(patient.allergies || []);
                    setChronicConditions(patient.chronicConditions || []);
                  }}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button type="button" onClick={saveClinicalInfo} disabled={savingClinical} className="btn-primary text-sm">
                  {savingClinical ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {editingAllergies ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Allergies</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {allergies.map((item) => (
                    <span key={item} className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      {item}
                      <button type="button" onClick={() => removeAllergy(item)}><X size={14} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder="e.g. Penicillin, Peanuts"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                  />
                  <button type="button" onClick={addAllergy} className="btn-secondary"><Plus size={18} /></button>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Chronic Conditions</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {chronicConditions.map((item) => (
                    <span key={item} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      {item}
                      <button type="button" onClick={() => removeCondition(item)}><X size={14} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder="e.g. Diabetes, Hypertension"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                  />
                  <button type="button" onClick={addCondition} className="btn-secondary"><Plus size={18} /></button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm">
              {patient.allergies?.length > 0 ? (
                <p className="text-red-600 font-medium">Allergies: {patient.allergies.join(', ')}</p>
              ) : (
                <p className="text-gray-500">No allergies recorded. Click &quot;Add Allergies&quot; to add them.</p>
              )}
              {patient.chronicConditions?.length > 0 && (
                <p className="text-orange-700 mt-1">Chronic conditions: {patient.chronicConditions.join(', ')}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary-700 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'records' && (
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">No medical records found</div>
          ) : (
            records.map((record) => (
              <div key={record._id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{formatDate(record.visitDate)}</p>
                    <p className="text-sm text-gray-500">Dr. {record.doctor?.user?.name}</p>
                  </div>
                </div>
                {record.chiefComplaint && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-400">Chief Complaint</p>
                    <p className="text-sm">{record.chiefComplaint}</p>
                  </div>
                )}
                {record.diagnosis && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-400">Diagnosis</p>
                    <p className="text-sm font-medium">{record.diagnosis}</p>
                  </div>
                )}
                {record.treatmentPlan && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-400">Treatment Plan</p>
                    <p className="text-sm">{record.treatmentPlan}</p>
                  </div>
                )}
                {record.notes && (
                  <div>
                    <p className="text-xs text-gray-400">Notes</p>
                    <p className="text-sm text-gray-600">{record.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">No prescriptions found</div>
          ) : (
            prescriptions.map((rx) => (
              <div key={rx._id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{formatDateTime(rx.createdAt)}</p>
                    <p className="text-sm text-gray-500">Dr. {rx.doctor?.user?.name}</p>
                  </div>
                  <Badge status={rx.status} />
                </div>
                <div className="space-y-2">
                  {rx.medicines?.map((med, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <p className="font-medium">{med.medicineName || med.medicine?.name}</p>
                      <p className="text-gray-500">
                        {med.dosage} — {med.frequency} — {med.duration}
                        {med.quantity ? ` (Qty: ${med.quantity})` : ''}
                      </p>
                      {med.instructions && <p className="text-gray-400 text-xs mt-1">{med.instructions}</p>}
                    </div>
                  ))}
                </div>
                {rx.notes && <p className="text-sm text-gray-600 mt-3">{rx.notes}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'lab' && (
        <div className="space-y-4">
          {labResults.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">No lab results found</div>
          ) : (
            labResults.map((order) => (
              <div key={order._id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{formatDateTime(order.orderedAt || order.createdAt)}</p>
                    <p className="text-sm text-gray-500">Dr. {order.doctor?.user?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge status={order.priority} />
                    <Badge status={order.status} />
                  </div>
                </div>
                <div className="space-y-2">
                  {order.tests?.map((test, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <span>{test.name}</span>
                      <span>{formatCurrency(test.price)}</span>
                    </div>
                  ))}
                </div>
                {order.results?.length > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Results</p>
                    {order.results.map((result, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm py-1">
                        <span>{result.labTest?.name || 'Test'}</span>
                        <span className={result.isAbnormal ? 'text-red-600 font-semibold' : ''}>
                          {result.value} {result.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'vitals' && (
        <div className="space-y-4">
          {vitals.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">No vital signs recorded</div>
          ) : (
            vitals.map((v) => (
              <div key={v._id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <p className="font-semibold">{formatDateTime(v.recordedAt)}</p>
                  <p className="text-sm text-gray-500">By {v.recordedBy?.name}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {v.temperature != null && (
                    <div><p className="text-xs text-gray-400">Temperature</p><p>{v.temperature} °C</p></div>
                  )}
                  {v.bloodPressure && (
                    <div><p className="text-xs text-gray-400">Blood Pressure</p><p>{v.bloodPressure.systolic}/{v.bloodPressure.diastolic} mmHg</p></div>
                  )}
                  {v.pulse != null && (
                    <div><p className="text-xs text-gray-400">Pulse</p><p>{v.pulse} bpm</p></div>
                  )}
                  {v.respiratoryRate != null && (
                    <div><p className="text-xs text-gray-400">Respiratory Rate</p><p>{v.respiratoryRate}/min</p></div>
                  )}
                  {v.oxygenSaturation != null && (
                    <div><p className="text-xs text-gray-400">SpO2</p><p>{v.oxygenSaturation}%</p></div>
                  )}
                  {v.weight != null && (
                    <div><p className="text-xs text-gray-400">Weight</p><p>{v.weight} kg</p></div>
                  )}
                  {v.height != null && (
                    <div><p className="text-xs text-gray-400">Height</p><p>{v.height} cm</p></div>
                  )}
                  {v.bloodGlucose != null && (
                    <div><p className="text-xs text-gray-400">Blood Glucose</p><p>{v.bloodGlucose} mg/dL</p></div>
                  )}
                </div>
                {v.notes && <p className="text-sm text-gray-600 mt-3">{v.notes}</p>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PatientDetail;
