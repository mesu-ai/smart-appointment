'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { format, addDays, setHours, setMinutes } from 'date-fns';

const AppointmentContext = createContext();

export function AppointmentProvider({ children }) {
  // Load initial data from localStorage
  const [appointments, setAppointments] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('appointments');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [queue, setQueue] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('queue');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [services, setServices] = useState([
    { id: 1, name: 'General Consultation', duration: 30, price: 50 },
    { id: 2, name: 'Medical Check-up', duration: 45, price: 75 },
    { id: 3, name: 'Dental Care', duration: 60, price: 100 },
    { id: 4, name: 'Eye Examination', duration: 30, price: 60 },
  ]);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('queue', JSON.stringify(queue));
  }, [queue]);

  const generateTimeSlots = (date) => {
    const slots = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = setMinutes(setHours(date, hour), minute);
        const timeString = format(slotTime, 'HH:mm');
        
        // Check if slot is already booked
        const isBooked = appointments.some(apt => 
          apt.date === format(date, 'yyyy-MM-dd') && apt.time === timeString
        );
        
        if (!isBooked) {
          slots.push(timeString);
        }
      }
    }
    return slots;
  };

  const bookAppointment = (appointmentData) => {
    const newAppointment = {
      id: Date.now(),
      ...appointmentData,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  };

  const joinQueue = (queueData) => {
    const position = queue.length + 1;
    const estimatedWaitTime = position * 15; // 15 minutes per person
    
    const newQueueEntry = {
      id: Date.now(),
      ...queueData,
      position,
      estimatedWaitTime,
      status: 'waiting',
      joinedAt: new Date().toISOString(),
    };
    
    setQueue(prev => [...prev, newQueueEntry]);
    return newQueueEntry;
  };

  const updateQueueStatus = (id, status) => {
    setQueue(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, status } : entry
      )
    );
    
    if (status === 'completed' || status === 'cancelled') {
      // Recalculate positions and wait times
      setQueue(prev => {
        const updated = prev.filter(entry => entry.id !== id);
        return updated.map((entry, index) => ({
          ...entry,
          position: index + 1,
          estimatedWaitTime: (index + 1) * 15,
        }));
      });
    }
  };

  const cancelAppointment = (id) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === id ? { ...apt, status: 'cancelled' } : apt
      )
    );
  };

  const updateAppointmentStatus = (id, status) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === id ? { ...apt, status } : apt
      )
    );
  };

  const getAppointmentsByDate = (date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.date === dateString);
  };

  const getUpcomingAppointments = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return appointments.filter(apt => 
      apt.date >= today && apt.status !== 'cancelled'
    ).sort((a, b) => {
      if (a.date === b.date) {
        return a.time.localeCompare(b.time);
      }
      return a.date.localeCompare(b.date);
    });
  };

  const value = {
    appointments,
    queue,
    services,
    generateTimeSlots,
    bookAppointment,
    joinQueue,
    updateQueueStatus,
    cancelAppointment,
    updateAppointmentStatus,
    getAppointmentsByDate,
    getUpcomingAppointments,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within AppointmentProvider');
  }
  return context;
}
