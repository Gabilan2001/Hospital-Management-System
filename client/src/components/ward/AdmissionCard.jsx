import Badge from '../common/Badge';
import { formatDate, formatCurrency } from '../../utils/helpers';

const AdmissionCard = ({ admission }) => (
  <div className="card">
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="font-semibold">
          {admission.patient?.firstName} {admission.patient?.lastName}
        </p>
        <p className="text-xs text-gray-500">{admission.patient?.patientId}</p>
      </div>
      <Badge status={admission.status} />
    </div>

    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
      <div>
        <p className="text-xs text-gray-400">Ward</p>
        <p>{admission.ward?.name}</p>
      </div>
      <div>
        <p className="text-xs text-gray-400">Bed</p>
        <p>{admission.bed?.bedNumber}</p>
      </div>
      <div>
        <p className="text-xs text-gray-400">Doctor</p>
        <p>Dr. {admission.doctor?.user?.name}</p>
      </div>
      <div>
        <p className="text-xs text-gray-400">Admitted</p>
        <p>{formatDate(admission.admissionDate)}</p>
      </div>
      <div className="col-span-2">
        <p className="text-xs text-gray-400">Daily Rate</p>
        <p>{formatCurrency(admission.bed?.pricePerDay)}</p>
      </div>
    </div>
  </div>
);

export default AdmissionCard;
