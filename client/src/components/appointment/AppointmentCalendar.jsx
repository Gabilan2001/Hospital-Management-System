import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enGB from 'date-fns/locale/en-GB';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-GB': enGB };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const AppointmentCalendar = ({ events, onSelectEvent, onSelectSlot }) => {
  const calendarEvents = events.map((e) => ({
    id: e._id,
    title: e.title || `${e.patient?.firstName || ''} - ${e.timeSlot || ''}`,
    start: new Date(e.date),
    end: new Date(new Date(e.date).getTime() + 20 * 60000),
    resource: e,
  }));

  return (
    <div className="h-[500px] bg-white rounded-xl p-4 border">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        views={['month', 'week', 'day']}
        defaultView="week"
        style={{ height: '100%' }}
      />
    </div>
  );
};

export default AppointmentCalendar;
