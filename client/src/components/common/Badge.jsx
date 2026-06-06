const Badge = ({ status, children }) => {
  const colors = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-indigo-100 text-indigo-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-orange-100 text-orange-800',
    waiting: 'bg-blue-100 text-blue-800',
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    dispensed: 'bg-green-100 text-green-800',
    urgent: 'bg-red-100 text-red-800',
    normal: 'bg-gray-100 text-gray-800',
  };

  const label = children || status?.replace(/-/g, ' ');

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {label}
    </span>
  );
};

export default Badge;
