
import { useState, useEffect } from 'react';
import { AppointmentType, fetchEvents } from '../services/calendarApi';
import { format, isValid } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';

export const useCalendarEvents = (appointmentType: AppointmentType) => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchEventsForDate = async () => {
      try {
        // Make sure date is valid before formatting
        if (!isValid(date)) {
          console.error('Invalid date:', date);
          setEvents([]);
          return;
        }
        
        const start = `${format(date, 'yyyy-MM-dd')}T00:00:00.000-03:00`;
        const end = `${format(date, 'yyyy-MM-dd')}T23:59:59.999-03:00`;
        const data = await fetchEvents(start, end, appointmentType);
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      }
    };

    fetchEventsForDate();
  }, [date, appointmentType]);

  return { date, setDate, events };
};

export default useCalendarEvents;
