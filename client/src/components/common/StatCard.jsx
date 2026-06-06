const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, trend }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-violet-500 to-violet-600',
    red: 'from-rose-500 to-rose-600',
    teal: 'from-teal-500 to-teal-600',
  };

  return (
    <div className="card relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform`} />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && <p className="text-xs text-emerald-600 mt-1 font-medium">{trend}</p>}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${colors[color]} text-white shadow-lg`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
