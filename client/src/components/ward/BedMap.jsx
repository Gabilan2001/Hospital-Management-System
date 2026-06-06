const BedMap = ({ bedMap }) => {
  if (!bedMap?.length) {
    return <p className="text-gray-500 text-center py-8">No ward data available</p>;
  }

  const statusColors = {
    available: 'bg-green-500 hover:bg-green-600',
    occupied: 'bg-red-500 hover:bg-red-600',
    maintenance: 'bg-gray-400 hover:bg-gray-500',
  };

  return (
    <div className="space-y-6">
      {bedMap.map(({ ward, beds }) => (
        <div key={ward._id} className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{ward.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{ward.type} | Floor {ward.floor}</p>
            </div>
            <div className="text-sm">
              <span className="text-green-600 font-medium">{ward.availableBeds}</span>
              <span className="text-gray-400"> / {ward.totalBeds} available</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {beds.map((bed) => (
              <div
                key={bed._id}
                title={`${bed.bedNumber} - ${bed.status} - LKR ${bed.pricePerDay}/day`}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-colors ${statusColors[bed.status]}`}
              >
                {bed.bedNumber.split('-')[1] || bed.bedNumber.slice(-2)}
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded" /> Available</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded" /> Occupied</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-400 rounded" /> Maintenance</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BedMap;
