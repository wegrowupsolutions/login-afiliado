import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { Card } from '@/components/ui/card';
import { AppointmentType } from '@/services/calendarApi';

interface CalendarSidebarProps {
  appointmentType: AppointmentType;
}

const CalendarSidebar = ({ appointmentType }: CalendarSidebarProps) => {
  const { date, setDate, events } = useCalendarEvents(appointmentType);

  return (
    <div className="w-[350px] border-r p-4 overflow-y-auto">
      <Card className="p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
        />
      </Card>
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Events for {date ? date.toLocaleDateString() : 'Today'}</h3>
        <ul>
          {events.length > 0 ? (
            events.map((event: any) => (
              <li key={event.id} className="mb-2">
                {event.title} - {event.start}
              </li>
            ))
          ) : (
            <li>No events for this day.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CalendarSidebar;
