import Badge from '../common/Badge';
import { formatDate, formatDoctorName } from '../../utils/helpers';
import { Clock, User, Building2 } from 'lucide-react';

const AppointmentCard = ({ appointment, onAction, actionLabel }) => (
  <div className="card hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="font-semibold text-gray-900">
          {appointment.patient?.firstName} {appointment.patient?.lastName}
        </p>
        <p className="text-xs text-gray-500">{appointment.appointmentNumber}</p>
      </div>
      <Badge status={appointment.status} />
    </div>

    <div className="space-y-2 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <User size={14} />
        {formatDoctorName(appointment.doctor?.user?.name)}
      </div>
      <div className="flex items-center gap-2">
        <Building2 size={14} />
        {appointment.department?.name}
      </div>
      <div className="flex items-center gap-2">
        <Clock size={14} />
        {formatDate(appointment.date)} | {appointment.timeSlot}
      </div>
      {appointment.queueNumber && (
        <p className="text-primary-700 font-medium">Queue #{appointment.queueNumber}</p>
      )}
    </div>

    {onAction && (
      <button onClick={() => onAction(appointment)} className="btn-primary w-full mt-4 text-sm">
        {actionLabel || 'View Details'}
      </button>
    )}
  </div>
);

export default AppointmentCard;
