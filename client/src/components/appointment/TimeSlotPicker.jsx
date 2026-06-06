const TimeSlotPicker = ({ slots, selected, onSelect, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!slots?.length) {
    return <p className="text-gray-500 text-sm py-4 text-center">No available slots for this date</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => onSelect(slot)}
          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
            selected === slot
              ? 'bg-primary-700 text-white border-primary-700'
              : 'bg-white hover:bg-primary-50 border-gray-200'
          }`}
        >
          {slot}
        </button>
      ))}
    </div>
  );
};

export default TimeSlotPicker;
