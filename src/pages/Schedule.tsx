
import React, { useState } from 'react';
import CalendarSidebar from '../components/schedule/CalendarSidebar';
import { AppointmentsSection } from '../components/schedule/AppointmentsSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentType } from '../services/calendarApi';

const Schedule = () => {
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('VET');

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <Tabs defaultValue="vet" onValueChange={(value) => setAppointmentType(value === 'vet' ? 'VET' : 'BANHO')}>
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="vet">Veterinário</TabsTrigger>
              <TabsTrigger value="banho">Banho</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <CalendarSidebar appointmentType={appointmentType} />
          <AppointmentsSection appointmentType={appointmentType} />
        </div>
      </div>
    </div>
  );
};

export default Schedule;
